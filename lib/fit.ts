import type { Fit } from "./types";

// Catalogue images that are studio shots on a white background and should be shown whole.
const CONTAIN = new Set<string>([
  "fixed-scissor",
  "mobile-scissor",
  "mobile-blue",
  "manual-scissor",
  "car-lift",
  "car-lift-orange",
  "vertical-car-lift",
  "goods-double",
  "goods-double-cad",
  "goods-double-2",
  "goods-single-illustration",
  "scissor-diagram",
  "dock-leveler-diagram",
  "ramp-diagram",
  "ramp-orange",
  "aerial-single-2",
]);


/** Decide how an image should be fitted into its frame. */
export function resolveFit(src: string, fit: Fit = "auto"): "contain" | "cover" {
  if (fit === "contain" || fit === "cover") return fit;
  if (src.startsWith("/images/products/")) {
    const name = src.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
    return CONTAIN.has(name) ? "contain" : "cover";
  }
  return "contain"; // uploaded images: never crop by surprise
}

/** Shown when a product / category has no image yet. */
export const PLACEHOLDER_IMG = "/images/logo-circle.png";
