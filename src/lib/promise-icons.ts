import type { IconName } from "@/components/icons";

/** The icon names Caelinex offers for a promise, mapped to this site's icons. */
const MAP: Record<string, IconName> = {
  truck: "box",
  package: "box",
  gift: "box",
  return: "arrow",
  shield: "shield",
  lock: "shield",
  award: "spark",
  star: "spark",
  heart: "heart",
  leaf: "sun",
  droplet: "drop",
  clock: "sun",
};

export const promiseIcon = (name: string): IconName | undefined => MAP[name];
