"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { whatsappHref } from "@/lib/site";
import { useSite } from "./SiteProvider";

/** WhatsApp quick-chat button + back-to-top, fixed to the bottom-right corner. */
export default function FloatingActions() {
  const site = useSite();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-ink-800/90 text-white shadow-card backdrop-blur transition hover:border-brand hover:text-brand"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <a
        href={whatsappHref(site, site.contact.whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] transition hover:scale-110"
      >
        <span className="absolute inset-0 animate-pulseRing rounded-full bg-[#25D366]" aria-hidden />
        <MessageCircle className="relative h-6 w-6" />
        <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-card transition group-hover:opacity-100">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
