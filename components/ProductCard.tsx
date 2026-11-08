import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PLACEHOLDER_IMG, resolveFit } from "@/lib/fit";
import type { ProductSummary } from "@/lib/types";

export default function ProductCard({
  product,
  categoryName = "",
  priority = false,
}: {
  product: ProductSummary;
  categoryName?: string;
  priority?: boolean;
}) {
  const src = product.image || PLACEHOLDER_IMG;
  const fit = product.image ? resolveFit(product.image, product.fit) : "contain";
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-500 hover:-translate-y-1.5 hover:border-brand/50 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        <Image
          src={src}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className={`transition duration-700 group-hover:scale-105 ${fit === "contain" ? "object-contain p-5" : "object-cover"}`}
        />
        <span className="absolute left-3 top-3 rounded-full bg-ink-900/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand backdrop-blur">
          {categoryName}
        </span>
        <span className="absolute bottom-3 right-3 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-brand text-ink-900 opacity-0 shadow-glow transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display-tight text-lg font-semibold leading-snug text-slate-900 transition group-hover:text-amber-700">
          {product.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{product.tagline}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {product.highlights.slice(0, 2).map((h) => (
            <li key={h.label} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700">
              <span className="text-slate-500">{h.label}:</span> {h.value}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
