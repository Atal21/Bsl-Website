import {
  ArrowUpFromLine,
  Boxes,
  Building2,
  Car,
  Cog,
  Eye,
  Factory,
  Gauge,
  Handshake,
  Layers,
  Package,
  ShieldCheck,
  Target,
  Timer,
  Truck,
  Warehouse,
  Wrench,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/lib/icon-names";

export type { IconName };

const icons: Record<IconName, React.ComponentType<LucideProps>> = {
  layers: Layers,
  car: Car,
  boxes: Boxes,
  arrowUp: ArrowUpFromLine,
  truck: Truck,
  warehouse: Warehouse,
  factory: Factory,
  shield: ShieldCheck,
  gauge: Gauge,
  wrench: Wrench,
  timer: Timer,
  handshake: Handshake,
  target: Target,
  eye: Eye,
  package: Package,
  building: Building2,
  cog: Cog,
};

export default function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Cmp = icons[name] ?? Package;
  return <Cmp {...props} />;
}
