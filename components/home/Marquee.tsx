import { getProducts } from "@/lib/data";

export default async function Marquee() {
  const products = await getProducts();
  if (!products.length) return null;
  const items = products.map((p) => p.name);
  const loop = [...items, ...items];
  return (
    <div id="intro" className="relative overflow-hidden border-y border-white/10 bg-ink-950 py-5">
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {loop.map((name, i) => (
          <span key={`${name}-${i}`} className="flex items-center gap-10 font-display text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            {name}
            <span className="h-2 w-2 rotate-45 bg-brand" />
          </span>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-950 to-transparent" />
    </div>
  );
}
