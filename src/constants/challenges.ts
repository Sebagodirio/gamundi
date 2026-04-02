import type { ChallengeCategory } from "../types";

interface SeedChallenge {
  title: string;
  description: string;
  category: ChallengeCategory;
  points_value: number;
  latitude?: number;
  longitude?: number;
  radius_meters?: number;
  country_code?: string;
  continent_code?: string;
}

export const SEED_CHALLENGES: SeedChallenge[] = [
  {
    title: "Visit Mexico City",
    description: "Explore the vibrant capital of Mexico.",
    category: "COUNTRY",
    points_value: 100,
    latitude: 19.4326,
    longitude: -99.1332,
    radius_meters: 50000,
    country_code: "MX",
    continent_code: "NA",
  },
  {
    title: "Chichén Itzá",
    description: "Stand before the ancient Mayan pyramid.",
    category: "WONDER",
    points_value: 300,
    latitude: 20.6843,
    longitude: -88.5678,
    radius_meters: 1000,
    country_code: "MX",
    continent_code: "NA",
  },
  {
    title: "Real de Catorce",
    description: "Discover the ghost town turned magic village.",
    category: "MAGIC_TOWN",
    points_value: 250,
    latitude: 23.6833,
    longitude: -100.9,
    radius_meters: 2000,
    country_code: "MX",
    continent_code: "NA",
  },
  {
    title: "Cenote Ik-Kil",
    description: "Swim in a hidden cenote in the Yucatán.",
    category: "HIDDEN_GEM",
    points_value: 200,
    latitude: 20.6723,
    longitude: -88.5751,
    radius_meters: 500,
    country_code: "MX",
    continent_code: "NA",
  },
  {
    title: "Visit Japan",
    description: "Set foot in the Land of the Rising Sun.",
    category: "COUNTRY",
    points_value: 100,
    latitude: 35.6762,
    longitude: 139.6503,
    radius_meters: 100000,
    country_code: "JP",
    continent_code: "AS",
  },
  {
    title: "Mount Fuji",
    description: "Reach the iconic peak of Japan.",
    category: "WONDER",
    points_value: 500,
    latitude: 35.3606,
    longitude: 138.7274,
    radius_meters: 5000,
    country_code: "JP",
    continent_code: "AS",
  },
];
