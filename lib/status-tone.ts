// Plain (non-client) module so both server pages and client components can import it.
export const statusTone = { new: "amber", contacted: "blue", quoted: "green", closed: "slate" } as const;
