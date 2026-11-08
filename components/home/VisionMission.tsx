import Image from "next/image";
import { getSettings } from "@/lib/data";
import { FALLBACK_LOGO } from "@/lib/site";
import Accent from "../Accent";
import Icon from "../Icon";
import Reveal from "../Reveal";

export default async function VisionMission() {
  const { about, home, logo } = await getSettings();
  const pu = home.purpose;
  if (!about.mission && !about.vision && !pu.title) return null;
  return (
    <section className="section">
      <div className="container-x">
        <div className="noise relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 sm:p-14">
          {/* watermark logo, like the catalogue's "Redefining" slide */}
          <Image
            src={logo || FALLBACK_LOGO}
            alt=""
            width={520}
            height={520}
            className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 opacity-[0.06]"
          />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <Reveal>
              {pu.eyebrow && <span className="eyebrow">{pu.eyebrow}</span>}
              <h2 className="font-display-tight mt-4 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
                <Accent title={pu.title} accent={pu.accent} />
              </h2>
              {(pu.lines.length > 0 || pu.accentLine) && (
                <p className="mt-6 text-lg font-semibold leading-snug text-slate-900">
                  {pu.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                  {pu.accentLine && <span className="block text-amber-700">{pu.accentLine}</span>}
                </p>
              )}
            </Reveal>

            <div className="grid gap-5">
              <Reveal delay={0.1}>
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-ink-900">
                      <Icon name="target" className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-xl font-bold text-slate-900">Mission</h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-700">
{about.mission}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-white">
                      <Icon name="eye" className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-xl font-bold text-slate-900">Vision</h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-700">
{about.vision}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
