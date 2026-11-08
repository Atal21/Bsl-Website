import { getSettings } from "@/lib/data";
import Counter from "../Counter";
import Reveal from "../Reveal";

export default async function Stats() {
  const { stats } = await getSettings();
  if (!stats.length) return null;
  return (
    <section className="relative border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="container-x grid grid-cols-2 gap-px overflow-hidden lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="px-4 py-10 text-center sm:py-14">
            <p className="font-display-tight text-4xl font-extrabold text-slate-900 sm:text-5xl">
              <span className="text-gradient">
                <Counter to={s.to} suffix={s.suffix} />
              </span>
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{s.label}</p>
            <p className="mt-1 text-xs text-slate-500">{s.note}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
