"use client";

import {
  Download,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, errMsg, fmtDate } from "@/lib/admin-client";
import {
  enquiryStatuses,
  type Enquiry,
  type EnquiryStatus,
  type NotificationLog,
} from "@/lib/types";
import { useConfirm, useToast } from "./feedback";
import { Badge, EmptyState, Field, Modal, PageHeader } from "./ui";
import { statusTone } from "@/lib/status-tone";

export default function EnquiriesManager({
  initial,
  openId,
}: {
  initial: Enquiry[];
  openId?: string;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState(initial);
  const [month, setMonth] = useState(() =>
    new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 7),
  );
  const [status, setStatus] = useState<"" | EnquiryStatus>("");
  const [q, setQ] = useState("");
  const [openIdState, setOpen] = useState<string | undefined>(openId);
  const [notes, setNotes] = useState<string | null>(null);
  const [notify, setNotify] = useState(true);
  const [log, setLog] = useState<NotificationLog[]>([]);
  const open = items.find((e) => e._id === openIdState);

  const loadLog = (id: string) =>
    api<{ log: NotificationLog[] }>(`/api/admin/enquiries/${id}`)
      .then((r) => setLog(r.log))
      .catch(() => setLog([]));
  useEffect(() => {
    if (openIdState) {
      setNotify(true);
      loadLog(openIdState);
    } else setLog([]);
  }, [openIdState]);

  const shown = useMemo(
    () =>
      items.filter(
        (e) =>
          (!status || e.status === status) &&
          (!q ||
            `${e.name} ${e.phone} ${e.email} ${e.company} ${e.product} ${e.message}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      ),
    [items, status, q],
  );

  async function update(
    e: Enquiry,
    patch: { status?: EnquiryStatus; notes?: string; notify?: boolean },
  ) {
    try {
      const { notification, ...u } = await api<
        Enquiry & { notification: string }
      >(`/api/admin/enquiries/${e._id}`, { method: "PATCH", body: patch });
      setItems((cur) => cur.map((x) => (x._id === u._id ? u : x)));
      if (patch.status) {
        if (notification === "sent")
          toast.success("Status updated and customer notified by email");
        else if (notification === "failed")
          toast.error(
            "Status updated, but the email could not be sent (see notification log).",
          );
        else if (notification === "skipped")
          toast.info(
            "Status updated. Email not sent: email provider is not configured.",
          );
        else toast.success("Status updated");
        loadLog(e._id);
      }
      return true;
    } catch (err) {
      toast.error(errMsg(err));
      return false;
    }
  }

  async function remove(e: Enquiry) {
    if (
      !(await confirm({
        title: "Delete this enquiry?",
        message: `From ${e.name}. This cannot be undone.`,
        confirmLabel: "Delete",
        danger: true,
      }))
    )
      return;
    try {
      await api(`/api/admin/enquiries/${e._id}`, { method: "DELETE" });
      setItems((cur) => cur.filter((x) => x._id !== e._id));
      setOpen(undefined);
      toast.success("Enquiry deleted");
    } catch (err) {
      toast.error(errMsg(err));
    }
  }

  const openEnquiry = (e: Enquiry) => {
    setOpen(e._id);
    setNotes(e.notes);
  };

  const counts = (s: EnquiryStatus) =>
    items.filter((e) => e.status === s).length;
  const wa = (phone: string) =>
    `https://wa.me/${phone
      .replace(/\D/g, "")
      .replace(/^0+/, "")
      .replace(/^(\d{10})$/, "91$1")}`;

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Messages and quote requests from the website. Changing the status can email the customer their ticket number and new status."
      >
        <a href="/api/admin/enquiries/export" className="abtn-ghost">
          <Download className="h-4 w-4" /> Export CSV
        </a>
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white p-1 pl-3">
          <input
            type="month"
            aria-label="Report month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent text-sm text-slate-700 outline-none"
          />
          <a
            href={`/api/admin/reports/monthly?month=${month}`}
            className="abtn-primary !py-1.5"
            aria-disabled={!month}
          >
            <Download className="h-4 w-4" /> Monthly report (.xlsx)
          </a>
        </div>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["", ...enquiryStatuses] as const).map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${status === s ? "bg-ink-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300"}`}
          >
            {s
              ? `${s[0].toUpperCase()}${s.slice(1)} (${counts(s)})`
              : `All (${items.length})`}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input !py-2 pl-9"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title="No enquiries"
          text="Nothing matches this view yet."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {shown.map((e) => (
              <li key={e._id}>
                <button
                  onClick={() => openEnquiry(e)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm text-slate-900 ${e.status === "new" ? "font-bold" : "font-semibold"}`}
                    >
                      <span className="font-mono text-xs text-slate-500">
                        {e.ref}
                      </span>{" "}
                      {e.name}{" "}
                      <span className="font-normal text-slate-500">
                        · {e.phone}
                        {e.company ? ` · ${e.company}` : ""}
                      </span>
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {e.product ? `${e.product} — ` : ""}
                      {e.message}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge tone={statusTone[e.status]}>{e.status}</Badge>
                    <p className="mt-1 text-xs text-slate-400">
                      {fmtDate(e.createdAt)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={!!open}
        onClose={() => setOpen(undefined)}
        title="Enquiry"
        footer={
          open && (
            <>
              <button
                className="abtn-danger mr-auto"
                onClick={() => remove(open)}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
              <button className="abtn-ghost" onClick={() => setOpen(undefined)}>
                Close
              </button>
              <button
                className="abtn-primary"
                onClick={async () => {
                  if (notes !== null && (await update(open, { notes })))
                    toast.success("Notes saved");
                }}
              >
                Save notes
              </button>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-4">
            <div>
              <p className="font-display text-lg font-bold text-slate-900">
                {open.name}
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-mono font-semibold text-slate-700">
                  {open.ref}
                </span>{" "}
                · {fmtDate(open.createdAt)}
              </p>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Phone
                </dt>
                <dd>{open.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Email
                </dt>
                <dd className="break-all">
                  {open.email || "—"}{" "}
                  {open.emailVerified && <Badge tone="green">verified</Badge>}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Company
                </dt>
                <dd>{open.company || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Product
                </dt>
                <dd>{open.product || "—"}</dd>
              </div>
            </dl>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Message
              </p>
              <p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
                {open.message}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className="abtn-ghost" href={`tel:${open.phone}`}>
                <Phone className="h-4 w-4" /> Call
              </a>
              <a
                className="abtn-ghost"
                href={wa(open.phone)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              {open.email && (
                <a className="abtn-ghost" href={`mailto:${open.email}`}>
                  <Mail className="h-4 w-4" /> Email
                </a>
              )}
            </div>
            <Field label="Status">
              <select
                className="input"
                value={open.status}
                onChange={(e) =>
                  update(open, {
                    status: e.target.value as EnquiryStatus,
                    notify,
                  })
                }
              >
                {enquiryStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <label
              className={`flex items-start gap-3 text-sm ${open.notifyEmail ? "cursor-pointer text-slate-700" : "text-slate-400"}`}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-amber-500"
                checked={notify && open.notifyEmail}
                disabled={!open.notifyEmail}
                onChange={(e) => setNotify(e.target.checked)}
              />
              <span>
                Notify customer by email when I change the status
                <span className="block text-xs text-slate-400">
                  {open.notifyEmail
                    ? "Only the ticket number and new status are sent - never the enquiry details."
                    : "The customer did not opt in to email updates (or gave no email)."}
                </span>
              </span>
            </label>
            <Field label="Internal notes">
              <textarea
                className="input min-h-[6rem]"
                value={notes ?? open.notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Only visible to admins"
              />
            </Field>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Notification log
              </p>
              {log.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Nothing has been sent for this enquiry.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
                  {log.map((n) => (
                    <li
                      key={n._id}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2"
                    >
                      <Badge
                        tone={
                          n.status === "sent"
                            ? "green"
                            : n.status === "failed"
                              ? "red"
                              : "slate"
                        }
                      >
                        {n.status}
                      </Badge>
                      <span className="text-slate-700">
                        {n.channel} ·{" "}
                        {n.kind === "created"
                          ? "ticket created"
                          : "status update"}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {n.to}
                      </span>
                      <span className="ml-auto text-xs text-slate-400">
                        {fmtDate(n.createdAt)}
                      </span>
                      {n.error && (
                        <span className="w-full text-xs text-slate-400">
                          {n.error}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
