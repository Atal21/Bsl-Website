// Usage: npm run create-admin -- you@example.com "StrongPassword" "Your Name"
import fs from "node:fs";
import path from "node:path";

// Load .env.local (Node's own loader is not available on older versions).
for (const file of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}


async function main() {
  const { hashPassword } = await import("../lib/auth");
  const { getStore } = await import("../lib/db");
  const [emailArg, password, name = "Admin"] = process.argv.slice(2);
  const email = emailArg?.trim().toLowerCase();
  if (!email || !password) {
    console.error('Usage: npm run create-admin -- <email> <password> ["Name"]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }
  const store = await getStore();
  const existing = await store.admins.findOne({ email });
  const passwordHash = await hashPassword(password);
  if (existing) {
    await store.admins.update(existing._id, { passwordHash, name });
    console.log(`Updated password for ${email}`);
  } else {
    await store.admins.insert({ email, name, passwordHash, createdAt: new Date().toISOString() });
    console.log(`Created admin ${email}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
