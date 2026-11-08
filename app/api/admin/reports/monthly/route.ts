import ExcelJS from "exceljs";
import { handle, HttpError, requireAdmin } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { enquiryStatuses } from "@/lib/types";

export const dynamic = "force-dynamic";

const IST = "+05:30";
const fmtDay = (iso: string) => new Date(Date.parse(iso) + 5.5 * 3600_000).toISOString().slice(0, 10);

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const month = new URL(req.url).searchParams.get("month") ?? "";
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!m) throw new HttpError(400, "Choose a month in YYYY-MM format.");

  // Month boundaries in Indian time.
  const [y, mo] = [Number(m[1]), Number(m[2])];
  const start = new Date(`${month}-01T00:00:00${IST}`).toISOString();
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
  const end = new Date(`${next}-01T00:00:00${IST}`).toISOString();

  const store = await getStore();
  const rows = (await store.enquiries.find({ filter: { createdAt: { $gte: start } }, sort: { createdAt: 1 } })).filter((r) => r.createdAt < end);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Admin panel";
  wb.created = new Date();
  const head = (ws: ExcelJS.Worksheet) => {
    const r = ws.getRow(1);
    r.font = { bold: true };
    r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFD60A" } };
    ws.views = [{ state: "frozen", ySplit: 1 }];
  };

  // ---- Summary
  const sum = wb.addWorksheet("Summary");
  sum.columns = [{ width: 28 }, { width: 14 }, { width: 14 }];
  sum.addRow([`Enquiry report - ${month}`]).font = { bold: true, size: 14 };
  sum.addRow(["Total enquiries", rows.length]);
  sum.addRow(["Email-verified", rows.filter((r) => r.emailVerified).length]);
  sum.addRow(["Opted in to email updates", rows.filter((r) => r.notifyEmail).length]);
  sum.addRow([]);
  sum.addRow(["Status", "Count", "Share"]).font = { bold: true };
  for (const s of enquiryStatuses) {
    const n = rows.filter((r) => r.status === s).length;
    const row = sum.addRow([s, n, rows.length ? n / rows.length : 0]);
    row.getCell(3).numFmt = "0%";
  }
  sum.addRow([]);
  sum.addRow(["Product", "Count"]).font = { bold: true };
  const byProduct = new Map<string, number>();
  for (const r of rows) byProduct.set(r.product || "(not specified)", (byProduct.get(r.product || "(not specified)") ?? 0) + 1);
  for (const [p, n] of [...byProduct].sort((a, b) => b[1] - a[1])) sum.addRow([p, n]);
  sum.addRow([]);
  sum.addRow(["Day", "Count"]).font = { bold: true };
  const byDay = new Map<string, number>();
  for (const r of rows) byDay.set(fmtDay(r.createdAt), (byDay.get(fmtDay(r.createdAt)) ?? 0) + 1);
  for (const [d, n] of byDay) sum.addRow([d, n]);

  // ---- Enquiries
  const ws = wb.addWorksheet("Enquiries");
  ws.columns = [
    { header: "Ticket", key: "ref", width: 18 },
    { header: "Date (IST)", key: "date", width: 18 },
    { header: "Name", key: "name", width: 22 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Email", key: "email", width: 28 },
    { header: "Email verified", key: "ev", width: 14 },
    { header: "Company", key: "company", width: 22 },
    { header: "Product", key: "product", width: 26 },
    { header: "Status", key: "status", width: 12 },
    { header: "Message", key: "message", width: 60 },
    { header: "Notes", key: "notes", width: 40 },
  ];
  head(ws);
  ws.autoFilter = { from: "A1", to: "K1" };
  for (const r of rows) {
    ws.addRow({
      ref: r.ref,
      date: new Date(Date.parse(r.createdAt) + 5.5 * 3600_000), // shifted so Excel shows Indian time
      name: r.name,
      phone: r.phone,
      email: r.email,
      ev: r.emailVerified ? "Yes" : "No",
      company: r.company,
      product: r.product,
      status: r.status,
      message: r.message,
      notes: r.notes,
    });
  }
  ws.getColumn("date").numFmt = "dd-mmm-yyyy hh:mm";
  ws.getColumn("message").alignment = { wrapText: true, vertical: "top" };

  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="bsl-enquiries-${month}.xlsx"`,
    },
  });
});
