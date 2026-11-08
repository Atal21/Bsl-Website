import { getSettings } from "@/lib/data";
import Accent, { hasText } from "../Accent";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

export default async function Process() {
  const { home } = await getSettings();
  const p = home.process;
  if (!p.steps.length) return null;
  return (
    <section className="section bg-slate-50">
      <div className="container-x">
        {hasText(p) && <SectionHeading eyebrow={p.eyebrow} align="center" title={<Accent title={p.title} accent={p.accent} />} description={p.description} />}

        <div className={`relative mt-16 grid gap-8 ${p.steps.length >= 4 ? "md:grid-cols-4" : p.steps.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          <div aria-hidden className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent md:block" />
          {p.steps.map((s, i) => (
            <Reveal key={`${s.title}-${i}`} delay={i * 0.1}>
              <div className="relative text-center md:text-left">
                <span className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-full border border-brand/50 bg-white font-display text-lg font-bold text-amber-700 md:mx-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display-tight mt-5 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
