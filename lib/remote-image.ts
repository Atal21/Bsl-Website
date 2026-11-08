import dns from "node:dns/promises";
import net from "node:net";
import sharp from "sharp";
import { HttpError } from "@/lib/api/http";
import { env } from "@/lib/env";
import { MAX_BYTES } from "@/lib/media";

// Server-side fetch of an admin-supplied image URL. Guards against SSRF (internal/private addresses),
// oversized downloads, slow servers and redirect tricks.

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 12_000;

export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) || a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateIp(v6.slice(7));
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe8") || v6.startsWith("fe9") || v6.startsWith("fea") || v6.startsWith("feb") || v6.startsWith("ff");
}

async function assertPublicHost(u: URL) {
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new HttpError(400, "Only http(s) image links are allowed.");
  if (u.username || u.password) throw new HttpError(400, "Links with a username/password are not allowed.");
  // Development only: lets you import from localhost while testing.
  if (!env.isProd() && process.env.ALLOW_PRIVATE_URL_IMPORT === "true") return;
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new HttpError(400, "That address is not allowed.");
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true }).catch(() => []);
  if (!addrs.length) throw new HttpError(400, "Could not reach that link (unknown host).");
  if (addrs.some((a) => isPrivateIp(a.address))) throw new HttpError(400, "That address is not allowed.");
}

export async function fetchRemoteImage(rawUrl: string): Promise<{ file: File; source: string }> {
  let u: URL;
  try {
    u = new URL(rawUrl.trim());
  } catch {
    throw new HttpError(400, "That does not look like a valid link.");
  }

  let res: Response | undefined;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(u);
    try {
      res = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: "image/*", "user-agent": "BSL-Enterprise-ImageImport/1.0" } });
    } catch {
      throw new HttpError(400, "Could not download that link (timed out or unreachable).");
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      if (hop === MAX_REDIRECTS) throw new HttpError(400, "Too many redirects.");
      u = new URL(res.headers.get("location") as string, u);
      continue;
    }
    break;
  }
  if (!res || !res.ok) throw new HttpError(400, `The link returned an error (${res?.status ?? "no response"}).`);

  const declared = Number(res.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) throw new HttpError(413, `That image is larger than ${MAX_BYTES / 1024 / 1024} MB.`);

  // Stream with a hard cap (content-length can lie or be absent).
  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = res.body?.getReader();
  if (!reader) throw new HttpError(400, "That link returned no data.");
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new HttpError(413, `That image is larger than ${MAX_BYTES / 1024 / 1024} MB.`);
    }
    chunks.push(value);
  }
  const buf = Buffer.concat(chunks);

  // Trust the bytes, not the Content-Type header.
  let format: string | undefined;
  try {
    format = (await sharp(buf).metadata()).format;
  } catch {
    /* handled below */
  }
  const mime = ({ jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" } as Record<string, string>)[format ?? ""];
  if (!mime) throw new HttpError(415, "That link is not a JPG, PNG, WebP or AVIF image.");

  const name = decodeURIComponent(u.pathname.split("/").pop() || "image").slice(0, 80) || "image";
  return { file: new File([new Uint8Array(buf)], name, { type: mime }), source: u.hostname };
}
