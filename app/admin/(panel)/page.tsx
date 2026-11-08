import { Boxes, Factory, ImageIcon, Inbox, Layers } from "lucide-react";
import Link from "next/link";
import { Badge, EmptyState, PageHeader, Panel } from "@/components/admin/ui";
import { statusTone } from "@/lib/status-tone";
import { fmtDate } from "@/lib/admin-client";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const s = await getStore();
  const [
    products,
    published,
    categories,
    industries,
    enquiries,
    newEnq,
    media,
    recent,
  ] = await Promise.all([
    s.products.count(),
    s.products.count({ filter: { published: true } }),
    s.categories.count(),
    s.industries.count(),
    s.enquiries.count(),
    s.enquiries.count({ filter: { status: "new" } }),
    s.media.count(),
    s.enquiries.find({ sort: { createdAt: -1 }, limit: 6 }),
  ]);

  const cards = [
    {
      label: "Products",
      value: products,
      sub: `${published} published`,
      href: "/admin/products",
      icon: Boxes,
    },
    {
      label: "Categories",
      value: categories,
      sub: "product groups",
      href: "/admin/categories",
      icon: Layers,
    },
    {
      label: "Industries",
      value: industries,
      sub: "served sectors",
      href: "/admin/industries",
      icon: Factory,
    },
    {
      label: "Enquiries",
      value: enquiries,
      sub: `${newEnq} new`,
      href: "/admin/enquiries",
      icon: Inbox,
    },
    {
      label: "Images",
      value: media,
      sub: "in library",
      href: "/admin/media",
      icon: ImageIcon,
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick look at your website content and incoming enquiries."
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, sub, href, icon: I }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-400 hover:shadow-md"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <I className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900">
              {value}
            </p>
            <p className="text-sm font-medium text-slate-700">{label}</p>
            <p className="text-xs text-slate-500">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Panel title="Latest enquiries" className="lg:col-span-2">
          {recent.length === 0 ? (
            <EmptyState
              title="No enquiries yet"
              text="Messages sent from the website contact form will show up here."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((e) => (
                <li key={e._id}>
                  <Link
                    href={`/admin/enquiries?open=${e._id}`}
                    className="flex items-start gap-3 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {e.name}{" "}
                        <span className="font-normal text-slate-500">
                          · {e.phone}
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
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Quick actions">
          <div className="flex flex-col gap-2">
            <Link className="abtn-primary" href="/admin/products/new">
              Add a product
            </Link>
            <Link className="abtn-ghost" href="/admin/media">
              Upload images
            </Link>
            <Link className="abtn-ghost" href="/admin/settings">
              Edit contact details &amp; home content
            </Link>
            <a className="abtn-ghost" href="/" target="_blank" rel="noreferrer">
              Open live website
            </a>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Changes you save here appear on the public website within a moment —
            no redeploy needed.
          </p>
        </Panel>
      </div>
    </>
  );
}
