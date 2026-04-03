import { useMemo } from "react";
import { CONTINENT_NAMES } from "../constants/countries";
import type { ContinentCode } from "../constants/countries";
import type { UserAchievement, Challenge } from "../types";

export interface TravelStats {
  countriesVisited: number;
  totalCountryChallenges: number;
  worldPercent: number;
  wondersVisited: number;
  hiddenGemsVisited: number;
  magicTownsVisited: number;
  continentsVisited: number;
  favoriteContinent: string | null;
  favoriteContinentCount: number;
  totalPoints: number;
  topChallenge: Challenge | null;
  continentBreakdown: Array<{ code: string; name: string; count: number }>;
}

export function useTravelStats(
  achievements: UserAchievement[],
  allChallenges: Challenge[],
  totalPoints: number
): TravelStats {
  return useMemo(() => {
    const totalCountryChallenges = allChallenges.filter(
      (c) => c.category === "COUNTRY"
    ).length;

    const countriesVisited = achievements.filter(
      (a) => a.challenge?.category === "COUNTRY"
    ).length;

    const wondersVisited = achievements.filter(
      (a) => a.challenge?.category === "WONDER"
    ).length;

    const hiddenGemsVisited = achievements.filter(
      (a) => a.challenge?.category === "HIDDEN_GEM"
    ).length;

    const magicTownsVisited = achievements.filter(
      (a) => a.challenge?.category === "MAGIC_TOWN"
    ).length;

    const worldPercent =
      totalCountryChallenges > 0
        ? Math.round((countriesVisited / totalCountryChallenges) * 100)
        : 0;

    // Continent breakdown
    const continentMap: Record<string, number> = {};
    for (const a of achievements) {
      const code = a.challenge?.continent_code;
      if (code && a.challenge?.category !== "CONTINENT") {
        continentMap[code] = (continentMap[code] ?? 0) + 1;
      }
    }

    const continentsVisited = Object.keys(continentMap).length;

    const sortedContinents = Object.entries(continentMap).sort(
      ([, a], [, b]) => b - a
    );

    const favoriteContinent =
      sortedContinents.length > 0
        ? (CONTINENT_NAMES as Record<string, string>)[sortedContinents[0][0]] ??
          sortedContinents[0][0]
        : null;

    const favoriteContinentCount = sortedContinents[0]?.[1] ?? 0;

    const continentBreakdown = sortedContinents.map(([code, count]) => ({
      code,
      name: (CONTINENT_NAMES as Record<string, string>)[code] ?? code,
      count,
    }));

    // Top challenge by points
    const topChallenge =
      achievements
        .filter((a) => a.challenge)
        .sort((a, b) => b.points_at_unlock - a.points_at_unlock)[0]
        ?.challenge ?? null;

    return {
      countriesVisited,
      totalCountryChallenges,
      worldPercent,
      wondersVisited,
      hiddenGemsVisited,
      magicTownsVisited,
      continentsVisited,
      favoriteContinent,
      favoriteContinentCount,
      totalPoints,
      topChallenge,
      continentBreakdown,
    };
  }, [achievements, allChallenges, totalPoints]);
}
