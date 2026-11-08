// Starter industries. Used ONLY by `npm run seed`.
import type { Industry } from "../../lib/types";

type SeedIndustry = Omit<Industry, "_id" | "order" | "published" | "createdAt" | "updatedAt">;

export const industries: SeedIndustry[] = [
  {
    slug: "trading",
    name: "Trading",
    icon: "package",
    blurb: "Fast, safe handling of goods in godowns, wholesale markets and showrooms — so stock moves as quickly as orders do.",
    needs: ["Lifting goods to upper storeys", "Loading and unloading trucks without a dock", "Showroom vehicle and product display lifts"],
    products: ["hydraulic-scissor-lift", "loading-unloading-lift", "hydraulic-goods-lift-single-mast", "car-lift"],
  },
  {
    slug: "warehousing",
    name: "Warehousing",
    icon: "warehouse",
    blurb: "Heavy-duty lifts and access platforms that keep multi-level storage safe, organised and productive.",
    needs: ["Floor-to-floor goods transfer", "Racking access and maintenance at height", "High-frequency continuous operation"],
    products: ["hydraulic-goods-lift-double-mast", "mobile-scissor-lift", "hydraulic-scissor-lift", "double-mast-aerial-working-platform"],
  },
  {
    slug: "logistics",
    name: "Logistics",
    icon: "truck",
    blurb: "Dock equipment that bridges the gap between truck and warehouse floor and cuts turnaround time.",
    needs: ["Rapid truck loading and unloading", "Forklift access into containers and carriages", "Reduced manpower and handling time"],
    products: ["fixed-dock-leveler", "movable-dock-ramp", "loading-unloading-lift"],
  },
  {
    slug: "factories",
    name: "Factories & Plants",
    icon: "factory",
    blurb: "Reliable vertical transport and elevated work access for multi-layer industrial plants.",
    needs: ["Material transfer between production floors", "Machine installation and maintenance at height", "Heavy-capacity platforms"],
    products: ["hydraulic-goods-lift-double-mast", "hydraulic-scissor-lift", "mobile-scissor-lift"],
  },
  {
    slug: "automotive",
    name: "Automotive & Parking",
    icon: "cog",
    blurb: "Car lifts for 4S shops, repair workshops and multi-level parking where space is at a premium.",
    needs: ["Vehicle elevating in workshops and showrooms", "Stacked and three-dimensional parking", "Upper-floor vehicle display"],
    products: ["car-lift", "vertical-car-lift", "high-rise-car-lift"],
  },
  {
    slug: "commercial",
    name: "Commercial Buildings",
    icon: "building",
    blurb: "Aerial platforms for hotels, malls, airports, stations and exhibition halls — cleaning, inspection and maintenance at height.",
    needs: ["Cleaning and maintenance at height", "Lighting and signage installation", "Temporary, flexible access"],
    products: ["single-mast-aerial-working-platform", "double-mast-aerial-working-platform", "mobile-scissor-lift"],
  },
];
