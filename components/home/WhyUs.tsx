import { getSettings } from "@/lib/data";
import Accent, { hasText } from "../Accent";
import Icon from "../Icon";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

export default async function WhyUs() {
  const { home } = await getSettings();
  const w = home.whyUs;
  if (!w.items.length) return null;
  return (
    <section className="section">
      <div className="container-x">
        {hasText(w) && <SectionHeading eyebrow={w.eyebrow} align="center" title={<Accent title={w.title} accent={w.accent} />} description={w.description} />}

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {w.items.map((s, i) => (
            <Reveal key={`${s.title}-${i}`} delay={(i % 3) * 0.08}>
              <div className="card group relative h-full overflow-hidden p-7 transition duration-500 hover:-translate-y-1 hover:border-brand/40">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/0 blur-2xl transition duration-500 group-hover:bg-brand/20" />
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-amber-700 transition duration-500 group-hover:bg-brand group-hover:text-ink-900">
                  <Icon name={s.icon} className="h-7 w-7" />
                </span>
                <h3 className="font-display-tight relative mt-6 text-xl font-semibold text-slate-900">{s.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
