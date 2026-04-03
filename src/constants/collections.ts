import type { Challenge } from "../types";

export interface CollectionDef {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  filter: (c: Challenge) => boolean;
}

export const COLLECTIONS: CollectionDef[] = [
  {
    id: "world_wonders",
    title: "Las Maravillas del Mundo",
    subtitle: "Los monumentos más icónicos del planeta",
    icon: "🏛️",
    color: "#FFD700",
    filter: (c) => c.category === "WONDER",
  },
  {
    id: "magic_towns",
    title: "Pueblos Mágicos",
    subtitle: "Joyas coloniales de México",
    icon: "✨",
    color: "#A78BFA",
    filter: (c) => c.category === "MAGIC_TOWN",
  },
  {
    id: "european_capitals",
    title: "Capitales Europeas",
    subtitle: "Los países del viejo continente",
    icon: "🏰",
    color: "#60A5FA",
    filter: (c) => c.category === "COUNTRY" && c.continent_code === "EU",
  },
  {
    id: "latin_america",
    title: "América Latina",
    subtitle: "Países de habla hispana y portuguesa",
    icon: "🌎",
    color: "#34D399",
    filter: (c) =>
      c.category === "COUNTRY" &&
      (c.continent_code === "SA" ||
        (c.continent_code === "NA" &&
          ["MX", "GT", "HN", "SV", "NI", "CR", "PA", "CU", "DO"].includes(
            c.country_code ?? ""
          ))),
  },
  {
    id: "hidden_gems",
    title: "Joyas Escondidas",
    subtitle: "Los lugares que pocos conocen",
    icon: "💎",
    color: "#F472B6",
    filter: (c) => c.category === "HIDDEN_GEM",
  },
  {
    id: "asia",
    title: "Asia Profunda",
    subtitle: "Los países del continente más grande",
    icon: "🏯",
    color: "#FB923C",
    filter: (c) => c.category === "COUNTRY" && c.continent_code === "AS",
  },
  {
    id: "africa",
    title: "Corazón de África",
    subtitle: "Descubre el continente olvidado",
    icon: "🦁",
    color: "#FCD34D",
    filter: (c) => c.category === "COUNTRY" && c.continent_code === "AF",
  },
  {
    id: "continents",
    title: "Los 6 Continentes",
    subtitle: "Domina todos los continentes del mundo",
    icon: "🗺️",
    color: "#818CF8",
    filter: (c) => c.category === "CONTINENT",
  },
];

export interface CollectionProgress {
  def: CollectionDef;
  total: number;
  unlocked: number;
  isComplete: boolean;
  challenges: Challenge[];
  unlockedIds: Set<string>;
}

export function computeCollections(
  allChallenges: Challenge[],
  unlockedChallengeIds: Set<string>
): CollectionProgress[] {
  return COLLECTIONS.map((def) => {
    const challenges = allChallenges.filter(def.filter);
    const unlocked = challenges.filter((c) => unlockedChallengeIds.has(c.id)).length;
    return {
      def,
      total: challenges.length,
      unlocked,
      isComplete: challenges.length > 0 && unlocked === challenges.length,
      challenges,
      unlockedIds: unlockedChallengeIds,
    };
  }).filter((cp) => cp.total > 0);
}
