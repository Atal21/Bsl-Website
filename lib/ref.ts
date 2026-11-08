import crypto from "node:crypto";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L

/** Customer-facing ticket number: BSL-<yymm>-<5 random chars>. Not guessable, safe to put in emails. */
export function newRef(now = new Date()) {
  const yymm = `${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  let tail = "";
  for (const b of crypto.randomBytes(5)) tail += ALPHABET[b % ALPHABET.length];
  return `BSL-${yymm}-${tail}`;
}

export const normalizeRef = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");
export const normalizeEmail = (s: string) => s.trim().toLowerCase();
