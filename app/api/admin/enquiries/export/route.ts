import { handle, requireAdmin } from "@/lib/api/http";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

const esc = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q") ?? "";
  const store = await getStore();
  const rows = await store.enquiries.find({
    filter: status && status !== "all" ? { status } : {},
    search: { fields: ["name", "phone", "email", "company", "product", "message"], q },
    sort: { createdAt: -1 },
  });
  const head = ["Ticket", "Date", "Name", "Phone", "Email", "Company", "Product", "Message", "Status", "Notes"];
  const lines = rows.map((r) =>
    [r.ref, r.createdAt, r.name, r.phone, r.email, r.company, r.product, r.message, r.status, r.notes].map(esc).join(","),
  );
  const csv = "﻿" + [head.map(esc).join(","), ...lines].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});
