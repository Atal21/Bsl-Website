// Usage:
//   npm run seed                 -> fill ONLY what is missing (safe to run on a live database)
//   npm run seed -- --reset-text -> also overwrite the site text with the starter text
//
// What it does:
//   * categories / products / industries: inserted only when that collection is EMPTY.
//   * site settings: every field that is missing or blank gets the starter value; fields you have
//     already edited in the admin panel are never touched (unless --reset-text).
// The website itself never reads these files - after seeding, all content comes from MongoDB.
import fs from "node:fs";
import path from "node:path";

for (const file of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const blank = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);

/** Keep what exists; take the starter value wherever the existing one is missing/blank. */
function fillMissing(existing: unknown, seed: unknown): unknown {
  if (isObj(seed)) {
    const base = isObj(existing) ? existing : {};
    const out: Record<string, unknown> = { ...base };
    for (const k of Object.keys(seed)) out[k] = fillMissing(base[k], seed[k]);
    return out;
  }
  return blank(existing) ? seed : existing;
}

async function main() {
  const resetText = process.argv.includes("--reset-text");
  const { getStore } = await import("../lib/db");
  const { categories, products } = await import("./seed/catalog");
  const { industries } = await import("./seed/industries");
  const { seedSettings } = await import("./seed/settings");
  const store = await getStore();
  const now = new Date().toISOString();
  const stamp = { createdAt: now, updatedAt: now };

  if ((await store.categories.count()) === 0) {
    for (const [i, c] of categories.entries()) await store.categories.insert({ ...c, order: i, ...stamp });
    console.log(`+ ${categories.length} categories`);
  } else console.log("= categories already exist - skipped");

  if ((await store.products.count()) === 0) {
    for (const [i, p] of products.entries()) {
      await store.products.insert({ advantages: [], specs: null, featured: false, ...p, fit: "auto", published: true, order: i, ...stamp });
    }
    console.log(`+ ${products.length} products`);
  } else console.log("= products already exist - skipped");

  if ((await store.industries.count()) === 0) {
    for (const [i, ind] of industries.entries()) await store.industries.insert({ ...ind, published: true, order: i, ...stamp });
    console.log(`+ ${industries.length} industries`);
  } else console.log("= industries already exist - skipped");

  const saved = await store.settings.findById("site");
  if (!saved) {
    await store.settings.insert({ _id: "site", ...seedSettings });
    console.log("+ site settings");
  } else {
    const { _id, ...current } = saved;
    void _id;
    const next = resetText ? { ...current, ...seedSettings } : (fillMissing(current, seedSettings) as Record<string, unknown>);
    await store.settings.update("site", next as never);
    console.log(resetText ? "~ site settings reset to starter text" : "~ site settings: missing fields filled, your edits kept");
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
