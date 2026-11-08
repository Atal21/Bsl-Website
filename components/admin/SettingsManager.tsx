"use client";

import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { api, errMsg, fmtDate } from "@/lib/admin-client";
import { iconNames } from "@/lib/icon-names";
import type { Heading, PageCopy, SiteSettings } from "@/lib/types";
import { useConfirm, useToast } from "./feedback";
import { ImageField } from "./ImagePicker";
import { Field, PageHeader, Panel, StringListEditor } from "./ui";

type Admin = { _id: string; name: string; email: string; createdAt: string };
const tabs = ["Contact & general", "Branding & SEO", "Home page", "Pages", "About", "Contact page", "Social & footer", "Account"] as const;

/** Eyebrow / title / highlighted words / description of one section. */
function HeadingEditor({ value, onChange, noDescription = false }: { value: Heading; onChange: (v: Heading) => void; noDescription?: boolean }) {
  const set = (k: keyof Heading, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Field label="Small label (above)"><input className="input" value={value.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} /></Field>
      <Field label="Heading"><input className="input" value={value.title} onChange={(e) => set("title", e.target.value)} /></Field>
      <Field label="Highlighted words" hint="Shown in colour after the heading."><input className="input" value={value.accent} onChange={(e) => set("accent", e.target.value)} /></Field>
      {!noDescription && (
        <Field label="Description" className="lg:col-span-3"><textarea className="input min-h-[4rem]" value={value.description} onChange={(e) => set("description", e.target.value)} /></Field>
      )}
    </div>
  );
}

function PageCopyEditor({ value, onChange }: { value: PageCopy; onChange: (v: PageCopy) => void }) {
  return (
    <div className="space-y-4">
      <HeadingEditor value={value} onChange={(h) => onChange({ ...value, ...h })} />
      <Field label="SEO description" hint="Shown in Google results for this page."><textarea className="input min-h-[4rem]" value={value.meta} onChange={(e) => onChange({ ...value, meta: e.target.value })} /></Field>
    </div>
  );
}

const lbl = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500";

export default function SettingsManager({ initial, admins, me }: { initial: SiteSettings; admins: Admin[]; me: string }) {
  const toast = useToast();
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((c) => ({ ...c, [k]: v }));
  const setHome = <K extends keyof SiteSettings["home"]>(k: K, v: SiteSettings["home"][K]) => setS((c) => ({ ...c, home: { ...c.home, [k]: v } }));
  const setPage = (k: keyof SiteSettings["pages"], v: PageCopy) => setS((c) => ({ ...c, pages: { ...c.pages, [k]: v } }));
  const setAbout = <K extends keyof SiteSettings["about"]>(k: K, v: SiteSettings["about"][K]) => setS((c) => ({ ...c, about: { ...c.about, [k]: v } }));
  const text = (k: "name" | "tagline" | "description" | "url" | "phone" | "email" | "whatsapp" | "address" | "hours" | "catalogPdf" | "footerText") => ({
    className: "input",
    value: s[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value),
  });

  async function save() {
    setBusy(true);
    const clean = (l: string[]) => l.map((x) => x.trim()).filter(Boolean);
    const body: SiteSettings = {
      ...s,
      whatsapp: s.whatsapp.replace(/\D/g, ""),
      heroCards: s.heroCards.filter((c) => c.image),
      seo: { ...s.seo, keywords: clean(s.seo.keywords) },
      hero: { ...s.hero, accentLines: clean(s.hero.accentLines), lines: clean(s.hero.lines), chips: clean(s.hero.chips) },
      home: {
        ...s.home,
        whyUs: { ...s.home.whyUs, items: s.home.whyUs.items.filter((i) => i.title.trim()) },
        purpose: { ...s.home.purpose, lines: clean(s.home.purpose.lines) },
        process: { ...s.home.process, steps: s.home.process.steps.filter((i) => i.title.trim()) },
      },
      about: { ...s.about, story: clean(s.about.story), commitments: clean(s.about.commitments) },
      contact: { ...s.contact, checklist: clean(s.contact.checklist) },
    };
    try {
      setS(await api<SiteSettings>("/api/admin/settings", { method: "PUT", body }));
      toast.success("Settings saved — live on the website");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Site settings" description="Everything you see on the website is edited here — company details, images, page text, SEO and account.">
        {tab !== "Account" && (
          <button className="abtn-primary" onClick={save} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
          </button>
        )}
      </PageHeader>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${tab === t ? "border-amber-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Contact & general" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Company">
            <div className="space-y-4">
              <Field label="Company name"><input {...text("name")} /></Field>
              <Field label="Tagline"><input {...text("tagline")} /></Field>
              <Field label="Short description (SEO)"><textarea {...text("description")} className="input min-h-[6rem]" /></Field>
              <Field label="Website URL" hint="Used for sitemap, emails and sharing, e.g. https://www.your-domain.com"><input {...text("url")} /></Field>
            </div>
          </Panel>
          <Panel title="Contact details">
            <div className="space-y-4">
              <Field label="Phone"><input {...text("phone")} /></Field>
              <Field label="Email"><input {...text("email")} type="email" /></Field>
              <Field label="WhatsApp number" hint="Digits with country code, e.g. 919876543210"><input {...text("whatsapp")} /></Field>
              <Field label="Address"><textarea {...text("address")} className="input min-h-[5rem]" /></Field>
              <Field label="Working hours"><input {...text("hours")} /></Field>
              <Field label="Catalogue PDF link" hint="URL of the downloadable catalogue. Leave empty to hide the Download buttons."><input {...text("catalogPdf")} /></Field>
            </div>
          </Panel>
        </div>
      )}

      {tab === "Branding & SEO" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Logo" description="Round logo shown in the header, footer, emails and social sharing.">
              <ImageField label="Logo" value={s.logo} onChange={(v) => set("logo", v)} />
            </Panel>
            <Panel title="Home hero background" description="Faded photo behind the home page headline.">
              <ImageField label="Background image" value={s.heroImage} onChange={(v) => set("heroImage", v)} />
            </Panel>
          </div>
          <Panel title="Hero product cards" description="Up to two floating product photos on the right of the home hero.">
            <div className="grid gap-6 lg:grid-cols-2">
              {[0, 1].map((i) => {
                const card = s.heroCards[i] ?? { image: "", label: "" };
                const upd = (patch: Partial<typeof card>) => {
                  const list = [0, 1].map((j) => s.heroCards[j] ?? { image: "", label: "" });
                  list[i] = { ...card, ...patch };
                  set("heroCards", list);
                };
                return (
                  <div key={i} className="space-y-3">
                    <ImageField label={`Card ${i + 1} image`} value={card.image} onChange={(v) => upd({ image: v })} />
                    <Field label="Caption"><input className="input" value={card.label} onChange={(e) => upd({ label: e.target.value })} /></Field>
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel title="Search engines (SEO)">
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Home page title" hint="Shown on the browser tab and in Google. Empty = company name + tagline."><input className="input" value={s.seo.title} onChange={(e) => set("seo", { ...s.seo, title: e.target.value })} /></Field>
              <div>
                <span className={lbl}>Keywords</span>
                <StringListEditor value={s.seo.keywords} onChange={(v) => set("seo", { ...s.seo, keywords: v })} addLabel="Add keyword" />
              </div>
            </div>
          </Panel>
        </div>
      )}

      {tab === "Home page" && (
        <div className="space-y-6">
          <Panel title="Hero section">
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Badge text"><input className="input" value={s.hero.badge} onChange={(e) => set("hero", { ...s.hero, badge: e.target.value })} /></Field>
              <Field label="Serves line"><input className="input" value={s.hero.servesLine} onChange={(e) => set("hero", { ...s.hero, servesLine: e.target.value })} /></Field>
              <div>
                <span className={lbl}>Headline (highlighted lines)</span>
                <StringListEditor value={s.hero.accentLines} onChange={(v) => set("hero", { ...s.hero, accentLines: v })} />
              </div>
              <div>
                <span className={lbl}>Headline (plain lines)</span>
                <StringListEditor value={s.hero.lines} onChange={(v) => set("hero", { ...s.hero, lines: v })} />
              </div>
              <Field label="Description" className="lg:col-span-2"><textarea className="input min-h-[5rem]" value={s.hero.description} onChange={(e) => set("hero", { ...s.hero, description: e.target.value })} /></Field>
              <div className="lg:col-span-2">
                <span className={lbl}>Feature chips</span>
                <StringListEditor value={s.hero.chips} onChange={(v) => set("hero", { ...s.hero, chips: v })} />
              </div>
              <Field label="Floating badge – line 1"><input className="input" value={s.hero.tagTitle} onChange={(e) => set("hero", { ...s.hero, tagTitle: e.target.value })} /></Field>
              <Field label="Floating badge – line 2 (highlighted)"><input className="input" value={s.hero.tagAccent} onChange={(e) => set("hero", { ...s.hero, tagAccent: e.target.value })} /></Field>
            </div>
          </Panel>

          <Panel title="Statistics counters" description="The first one is also shown on the hero card.">
            <div className="space-y-3">
              {s.stats.map((st, i) => (
                <div key={i} className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[6rem_5rem_1fr_1fr_auto]">
                  <input className="input" type="number" min={0} value={st.to} onChange={(e) => set("stats", s.stats.map((x, j) => (j === i ? { ...x, to: Number(e.target.value) || 0 } : x)))} aria-label="Number" />
                  <input className="input" value={st.suffix} placeholder="+" onChange={(e) => set("stats", s.stats.map((x, j) => (j === i ? { ...x, suffix: e.target.value } : x)))} aria-label="Suffix" />
                  <input className="input" value={st.label} placeholder="Label" onChange={(e) => set("stats", s.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  <input className="input" value={st.note} placeholder="Small note" onChange={(e) => set("stats", s.stats.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} />
                  <button type="button" className="abtn-icon hover:!text-red-600" aria-label="Remove" onClick={() => set("stats", s.stats.filter((_, j) => j !== i))}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {s.stats.length < 8 && (
                <button type="button" className="abtn-ghost" onClick={() => set("stats", [...s.stats, { to: 0, suffix: "+", label: "", note: "" }])}>
                  <Plus className="h-4 w-4" /> Add stat
                </button>
              )}
            </div>
          </Panel>

          <Panel title="Categories section" description="Heading above the product categories (the cards come from Admin → Categories).">
            <HeadingEditor value={s.home.categories} onChange={(v) => setHome("categories", v)} />
          </Panel>
          <Panel title="Featured products section" description="The products shown come from Admin → Products (tick “Featured”).">
            <HeadingEditor value={s.home.featured} onChange={(v) => setHome("featured", v)} />
          </Panel>

          <Panel title="Why choose us section">
            <div className="space-y-5">
              <HeadingEditor value={s.home.whyUs} onChange={(h) => setHome("whyUs", { ...s.home.whyUs, ...h })} />
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <span className={lbl}>Points</span>
                {s.home.whyUs.items.map((it, i) => {
                  const upd = (patch: Partial<typeof it>) => setHome("whyUs", { ...s.home.whyUs, items: s.home.whyUs.items.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
                  return (
                    <div key={i} className="grid items-start gap-2 sm:grid-cols-[9rem_1fr_2fr_auto]">
                      <select className="input" value={it.icon} onChange={(e) => upd({ icon: e.target.value as typeof it.icon })} aria-label="Icon">
                        {iconNames.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <input className="input" placeholder="Title" value={it.title} onChange={(e) => upd({ title: e.target.value })} />
                      <textarea className="input min-h-[3rem]" placeholder="Text" value={it.text} onChange={(e) => upd({ text: e.target.value })} />
                      <button type="button" className="abtn-icon hover:!text-red-600" aria-label="Remove" onClick={() => setHome("whyUs", { ...s.home.whyUs, items: s.home.whyUs.items.filter((_, j) => j !== i) })}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
                {s.home.whyUs.items.length < 12 && (
                  <button type="button" className="abtn-ghost" onClick={() => setHome("whyUs", { ...s.home.whyUs, items: [...s.home.whyUs.items, { icon: "cog", title: "", text: "" }] })}>
                    <Plus className="h-4 w-4" /> Add point
                  </button>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="Industries section" description="Heading only — the cards come from Admin → Industries.">
            <HeadingEditor value={s.home.industries} onChange={(v) => setHome("industries", v)} />
          </Panel>

          <Panel title="Purpose / vision banner" description="Mission and vision text itself is edited in the About tab.">
            <div className="space-y-5">
              <HeadingEditor value={s.home.purpose} onChange={(h) => setHome("purpose", { ...s.home.purpose, ...h })} noDescription />
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <span className={lbl}>Tagline lines</span>
                  <StringListEditor value={s.home.purpose.lines} onChange={(v) => setHome("purpose", { ...s.home.purpose, lines: v })} />
                </div>
                <Field label="Last line (highlighted)"><input className="input" value={s.home.purpose.accentLine} onChange={(e) => setHome("purpose", { ...s.home.purpose, accentLine: e.target.value })} /></Field>
              </div>
            </div>
          </Panel>

          <Panel title="How we work (process steps)">
            <div className="space-y-5">
              <HeadingEditor value={s.home.process} onChange={(h) => setHome("process", { ...s.home.process, ...h })} />
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <span className={lbl}>Steps (numbered automatically)</span>
                {s.home.process.steps.map((st, i) => {
                  const upd = (patch: Partial<typeof st>) => setHome("process", { ...s.home.process, steps: s.home.process.steps.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
                  return (
                    <div key={i} className="grid items-start gap-2 sm:grid-cols-[1fr_2fr_auto]">
                      <input className="input" placeholder="Title" value={st.title} onChange={(e) => upd({ title: e.target.value })} />
                      <textarea className="input min-h-[3rem]" placeholder="Text" value={st.text} onChange={(e) => upd({ text: e.target.value })} />
                      <button type="button" className="abtn-icon hover:!text-red-600" aria-label="Remove" onClick={() => setHome("process", { ...s.home.process, steps: s.home.process.steps.filter((_, j) => j !== i) })}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
                {s.home.process.steps.length < 8 && (
                  <button type="button" className="abtn-ghost" onClick={() => setHome("process", { ...s.home.process, steps: [...s.home.process.steps, { title: "", text: "" }] })}>
                    <Plus className="h-4 w-4" /> Add step
                  </button>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="Call-to-action banner" description="Shown at the bottom of most pages.">
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Title"><input className="input" value={s.cta.title} onChange={(e) => set("cta", { ...s.cta, title: e.target.value })} /></Field>
              <Field label="Text"><textarea className="input min-h-[4rem]" value={s.cta.text} onChange={(e) => set("cta", { ...s.cta, text: e.target.value })} /></Field>
            </div>
          </Panel>
        </div>
      )}

      {tab === "Pages" && (
        <div className="space-y-6">
          {(["products", "industries", "about", "contact"] as const).map((k) => (
            <Panel key={k} title={`${k[0].toUpperCase()}${k.slice(1)} page banner`} description="Top banner text and the SEO description of the page. The small label is also used as the browser-tab title.">
              <PageCopyEditor value={s.pages[k]} onChange={(v) => setPage(k, v)} />
            </Panel>
          ))}
        </div>
      )}

      {tab === "About" && (
        <div className="space-y-6">
          <Panel title="Story heading"><HeadingEditor value={s.about.storyHeading} onChange={(v) => setAbout("storyHeading", v)} noDescription /></Panel>
          <Panel title="Company story" description="Each item is one paragraph.">
            <StringListEditor multiline value={s.about.story} onChange={(v) => setAbout("story", v)} addLabel="Add paragraph" />
          </Panel>
          <Panel title="Commitments" description="Checklist next to the story.">
            <StringListEditor value={s.about.commitments} onChange={(v) => setAbout("commitments", v)} addLabel="Add commitment" />
          </Panel>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Mission"><textarea className="input min-h-[7rem]" value={s.about.mission} onChange={(e) => setAbout("mission", e.target.value)} /></Panel>
            <Panel title="Vision"><textarea className="input min-h-[7rem]" value={s.about.vision} onChange={(e) => setAbout("vision", e.target.value)} /></Panel>
          </div>
          <Panel title="“What drives us” heading" description="The cards below it are the “Why choose us” points from the Home page tab.">
            <HeadingEditor value={s.about.values} onChange={(v) => setAbout("values", v)} />
          </Panel>
          <Panel title="“Our range” heading" description="The chips below it are your product categories.">
            <HeadingEditor value={s.about.range} onChange={(v) => setAbout("range", v)} />
            <div className="mt-4 max-w-md">
              <Field label="Extra chip label" hint="Leave empty to hide."><input className="input" value={s.about.customLabel} onChange={(e) => setAbout("customLabel", e.target.value)} /></Field>
            </div>
          </Panel>
        </div>
      )}

      {tab === "Contact page" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="“What to include” box">
            <div className="space-y-4">
              <Field label="Box title"><input className="input" value={s.contact.checklistTitle} onChange={(e) => set("contact", { ...s.contact, checklistTitle: e.target.value })} /></Field>
              <div>
                <span className={lbl}>Points</span>
                <StringListEditor value={s.contact.checklist} onChange={(v) => set("contact", { ...s.contact, checklist: v })} />
              </div>
            </div>
          </Panel>
          <Panel title="WhatsApp">
            <Field label="Default WhatsApp message" hint="Pre-filled when a visitor taps the WhatsApp buttons.">
              <textarea className="input min-h-[5rem]" value={s.contact.whatsappMessage} onChange={(e) => set("contact", { ...s.contact, whatsappMessage: e.target.value })} />
            </Field>
          </Panel>
        </div>
      )}

      {tab === "Social & footer" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Social links" description="Leave empty to hide an icon.">
            <div className="space-y-4">
              {(["facebook", "instagram", "linkedin", "youtube"] as const).map((k) => (
                <Field key={k} label={k}>
                  <input className="input" placeholder="https://…" value={s.social[k]} onChange={(e) => set("social", { ...s.social, [k]: e.target.value })} />
                </Field>
              ))}
            </div>
          </Panel>
          <Panel title="Footer">
            <Field label="Footer description"><textarea {...text("footerText")} className="input min-h-[7rem]" /></Field>
          </Panel>
        </div>
      )}

      {tab === "Account" && <AccountTab admins={admins} me={me} />}
    </>
  );
}

function AccountTab({ admins: initial, me }: { admins: Admin[]; me: string }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [admins, setAdmins] = useState(initial);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [nu, setNu] = useState({ name: "", email: "", password: "" });

  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next !== pw.confirm) return toast.error("New passwords do not match.");
    try {
      await api("/api/admin/auth/password", { body: { current: pw.current, next: pw.next } });
      setPw({ current: "", next: "", confirm: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(errMsg(err));
    }
  }

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const a = await api<Admin>("/api/admin/users", { body: nu });
      setAdmins((c) => [...c, a]);
      setNu({ name: "", email: "", password: "" });
      toast.success("Admin added");
    } catch (err) {
      toast.error(errMsg(err));
    }
  }

  async function removeAdmin(a: Admin) {
    if (!(await confirm({ title: `Remove ${a.name}?`, message: "They will no longer be able to sign in.", confirmLabel: "Remove", danger: true }))) return;
    try {
      await api(`/api/admin/users/${a._id}`, { method: "DELETE" });
      setAdmins((c) => c.filter((x) => x._id !== a._id));
      toast.success("Admin removed");
    } catch (err) {
      toast.error(errMsg(err));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Change password">
        <form onSubmit={changePw} className="space-y-4">
          <Field label="Current password"><input className="input" type="password" autoComplete="current-password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
          <Field label="New password" hint="At least 8 characters."><input className="input" type="password" autoComplete="new-password" required minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
          <Field label="Confirm new password"><input className="input" type="password" autoComplete="new-password" required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
          <button className="abtn-primary">Update password</button>
        </form>
      </Panel>

      <Panel title="Admins" description="People who can sign in to this panel.">
        <ul className="mb-5 divide-y divide-slate-100">
          {admins.map((a) => (
            <li key={a._id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{a.name}{a._id === me && <span className="ml-2 text-xs font-normal text-amber-700">(you)</span>}</p>
                <p className="truncate text-xs text-slate-500">{a.email} · added {fmtDate(a.createdAt)}</p>
              </div>
              {a._id !== me && (
                <button className="abtn-icon hover:!bg-red-50 hover:!text-red-600" aria-label={`Remove ${a.name}`} onClick={() => removeAdmin(a)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
        <form onSubmit={addAdmin} className="space-y-3 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-800">Add another admin</p>
          <input className="input" placeholder="Name" required value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} />
          <input className="input" type="email" placeholder="Email" required value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password (min 8 characters)" required minLength={8} autoComplete="new-password" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} />
          <button className="abtn-primary">Add admin</button>
        </form>
      </Panel>
    </div>
  );
}
