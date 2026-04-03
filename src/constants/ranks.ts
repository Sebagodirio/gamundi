import type { RankTier } from "../types";

export interface RankInfo {
  tier: RankTier;
  label: string;
  icon: string;
  color: string;
  minPoints: number;
  maxPoints: number | null; // null = no upper limit (highest rank)
  description: string;
}

export const RANKS: RankInfo[] = [
  {
    tier: "BRONZE",
    label: "Nómada Principiante",
    icon: "🥾",
    color: "#CD7F32",
    minPoints: 0,
    maxPoints: 499,
    description: "Acabas de empezar tu aventura. El mundo te espera.",
  },
  {
    tier: "SILVER",
    label: "Explorador Curioso",
    icon: "🧭",
    color: "#C0C0C0",
    minPoints: 500,
    maxPoints: 1499,
    description: "Tu curiosidad te lleva a nuevos destinos.",
  },
  {
    tier: "GOLD",
    label: "Viajero Audaz",
    icon: "✈️",
    color: "#FFD700",
    minPoints: 1500,
    maxPoints: 3999,
    description: "Cada frontera que cruzas te hace más audaz.",
  },
  {
    tier: "PLATINUM",
    label: "Aventurero Global",
    icon: "🌏",
    color: "#A8E6CF",
    minPoints: 4000,
    maxPoints: 9999,
    description: "El planeta es tu patio de juegos.",
  },
  {
    tier: "DIAMOND",
    label: "Leyenda Global",
    icon: "👑",
    color: "#B9F2FF",
    minPoints: 10000,
    maxPoints: null,
    description: "Tu nombre se escribe en los mapas del mundo.",
  },
];

export const RANK_MAP = Object.fromEntries(
  RANKS.map((r) => [r.tier, r])
) as Record<RankTier, RankInfo>;

export function getRankInfo(tier: RankTier): RankInfo {
  return RANK_MAP[tier] ?? RANKS[0];
}

export function getNextRank(tier: RankTier): RankInfo | null {
  const idx = RANKS.findIndex((r) => r.tier === tier);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

/** Returns 0–1 progress fraction from current rank's min to next rank's min. */
export function getXPProgress(points: number, tier: RankTier): number {
  const current = getRankInfo(tier);
  const next = getNextRank(tier);
  if (!next) return 1;
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.min(1, Math.max(0, progress / range));
}

export function pointsToNextRank(points: number, tier: RankTier): number {
  const next = getNextRank(tier);
  if (!next) return 0;
  return Math.max(0, next.minPoints - points);
}
