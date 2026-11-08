// Icons an admin can pick for categories / industries. Keep in sync with components/Icon.tsx.
export const iconNames = [
  "layers",
  "car",
  "boxes",
  "arrowUp",
  "truck",
  "warehouse",
  "factory",
  "shield",
  "gauge",
  "wrench",
  "timer",
  "handshake",
  "target",
  "eye",
  "package",
  "building",
  "cog",
] as const;

export type IconName = (typeof iconNames)[number];
