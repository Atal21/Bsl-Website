"use client";

import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { PLACEHOLDER_IMG, resolveFit } from "@/lib/fit";
import type { Fit } from "@/lib/types";

export default function ProductGallery({ images, name, fitMode = "auto" }: { images: string[]; name: string; fitMode?: Fit }) {
  if (!images.length) images = [PLACEHOLDER_IMG];
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = images[index];
  const fit = current === PLACEHOLDER_IMG ? "contain" : resolveFit(current, fitMode);
  const go = (d: number) => setIndex((i) => (i + d + images.length) % images.length);

  return (
    <div>
      <div
        className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card transition-all ${
          zoom ? "aspect-[4/5] sm:aspect-square" : "aspect-[4/3]"
        }`}
      >
        <Image
          key={current}
          src={current}
          alt={`${name} – view ${index + 1}`}
          fill
          priority
          sizes="(min-width:1024px) 50vw, 100vw"
          className={`animate-[fadeIn_.5s_ease] ${fit === "contain" ? "object-contain p-6" : "object-cover"}`}
        />
        <button
          type="button"
          onClick={() => setZoom((z) => !z)}
          aria-label="Toggle larger view"
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-ink-900/80 text-white backdrop-blur transition hover:bg-brand hover:text-ink-900"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink-900/80 text-white opacity-0 backdrop-blur transition hover:bg-brand hover:text-ink-900 group-hover:opacity-100 max-sm:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink-900/80 text-white opacity-0 backdrop-blur transition hover:bg-brand hover:text-ink-900 group-hover:opacity-100 max-sm:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        {/* branded corner mark, like the catalogue photos */}
        <Image
          src="/images/logo-circle.png"
          alt=""
          width={40}
          height={40}
          className="absolute bottom-3 left-3 rounded-full opacity-90"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-white transition ${
                i === index ? "border-brand shadow-glow" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="120px"
                className={resolveFit(src, fitMode) === "contain" ? "object-contain p-1.5" : "object-cover"}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
