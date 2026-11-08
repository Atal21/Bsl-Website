export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
  }
}

type Opts = { method?: string; body?: unknown; form?: FormData };

/** fetch wrapper for the admin API: JSON in/out, throws ApiError with the server's message. */
export async function api<T = unknown>(path: string, opts: Opts = {}): Promise<T> {
  const hasBody = opts.body !== undefined || opts.form !== undefined;
  const res = await fetch(path, {
    method: opts.method ?? (hasBody ? "POST" : "GET"),
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
    credentials: "same-origin",
  });
  const json = await res.json().catch(() => null);
  if (res.status === 401 && !path.includes("/auth/login") && typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
  if (!res.ok) throw new ApiError(json?.error ?? `Request failed (${res.status})`, res.status, json?.details);
  return json as T;
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong.");

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

export const fmtBytes = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
