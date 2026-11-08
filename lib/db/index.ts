import { assertProductionEnv } from "@/lib/env";
import { newRef } from "@/lib/ref";
import { createMongoStore } from "./mongo";
import type { Store } from "./types";
import dns from "node:dns";


dns.setServers(["8.8.8.8", "1.1.1.1"]);

const g = globalThis as unknown as { __bslStore?: Promise<Store> };

/** Enquiries saved before ticket numbers existed get one (cheap: only touches documents without a ref). */
async function backfillRefs(store: Store) {
  for (const e of await store.enquiries.find({ filter: { ref: null } })) {
    await store.enquiries.update(e._id, { ref: newRef(new Date(e.createdAt)), notifyEmail: false, emailVerified: false });
  }
}

async function init(): Promise<Store> {
  assertProductionEnv();
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("MONGODB_URI is not set. This website stores all of its data in MongoDB - add the connection string to your environment.");
  const store = await createMongoStore(uri);
  await backfillRefs(store);
  return store;
}

/** Shared MongoDB data store (one connection per server process, reused across requests). */
export function getStore(): Promise<Store> {
  if (!g.__bslStore) {
    g.__bslStore = init().catch((e) => {
      g.__bslStore = undefined; // allow a retry on the next request
      throw e;
    });
  }
  return g.__bslStore;
}
