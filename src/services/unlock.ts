import { supabase } from "./supabase";
import { createTrip } from "./trips";
import { COUNTRY_TO_CONTINENT } from "../constants/countries";
import type { Challenge, Coordinates, LocationData, UnlockResult } from "../types";

function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const RANK_THRESHOLDS: Record<string, number> = {
  BRONZE: 0,
  SILVER: 500,
  GOLD: 1500,
  PLATINUM: 4000,
  DIAMOND: 10000,
};

function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(sin2));
}

function isWithinRadius(
  userCoords: Coordinates,
  challengeCoords: Coordinates,
  radiusMeters: number
): boolean {
  return haversineDistance(userCoords, challengeCoords) <= radiusMeters;
}

function resolveRankTier(totalPoints: number): string {
  const tiers = Object.entries(RANK_THRESHOLDS).sort(([, a], [, b]) => b - a);
  for (const [tier, threshold] of tiers) {
    if (totalPoints >= threshold) return tier;
  }
  return "BRONZE";
}

async function checkContinentCompletion(
  userId: string,
  newlyUnlocked: Challenge[]
): Promise<UnlockResult[]> {
  // Collect unique continent codes from newly unlocked COUNTRY challenges
  const continentCodes = new Set<string>();
  for (const c of newlyUnlocked) {
    if (c.category === "COUNTRY" && c.country_code) {
      const continent = COUNTRY_TO_CONTINENT[c.country_code];
      if (continent) continentCodes.add(continent);
    }
  }

  if (continentCodes.size === 0) return [];

  const results: UnlockResult[] = [];

  for (const continentCode of continentCodes) {
    // How many COUNTRY challenges exist for this continent?
    const { data: allForContinent } = await supabase
      .from("challenges")
      .select("id")
      .eq("category", "COUNTRY")
      .eq("continent_code", continentCode)
      .eq("is_active", true);

    if (!allForContinent || allForContinent.length === 0) continue;

    const continentChallengeIds = allForContinent.map((r: { id: string }) => r.id);

    // How many of those does the user have?
    const { data: userHas } = await supabase
      .from("user_achievements")
      .select("challenge_id")
      .eq("user_id", userId)
      .in("challenge_id", continentChallengeIds);

    if (!userHas || userHas.length < continentChallengeIds.length) continue;

    // User has them all — find and unlock the CONTINENT challenge
    const { data: continentChallenge } = await supabase
      .from("challenges")
      .select("*")
      .eq("category", "CONTINENT")
      .eq("continent_code", continentCode)
      .eq("is_active", true)
      .single();

    if (!continentChallenge) continue;

    // Check not already unlocked
    const { data: alreadyUnlocked } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("challenge_id", continentChallenge.id)
      .maybeSingle();

    if (alreadyUnlocked) continue;

    const { error: insertError } = await supabase.from("user_achievements").insert({
      id: uuidv4(),
      user_id: userId,
      challenge_id: continentChallenge.id,
      points_at_unlock: continentChallenge.points_value,
    });

    if (insertError) {
      results.push({
        success: false,
        challenge_id: continentChallenge.id,
        error: insertError.message,
        type: "CONTINENT",
      });
      continue;
    }

    // Update points
    const { data: userRow } = await supabase
      .from("users")
      .select("total_points")
      .eq("id", userId)
      .single();

    const newTotal =
      ((userRow as { total_points: number } | null)?.total_points ?? 0) +
      continentChallenge.points_value;

    await supabase
      .from("users")
      .update({ total_points: newTotal, rank: resolveRankTier(newTotal) })
      .eq("id", userId);

    results.push({
      success: true,
      challenge_id: continentChallenge.id,
      points_earned: continentChallenge.points_value,
      type: "CONTINENT",
      title: continentChallenge.title,
    });
  }

  return results;
}

export async function evaluateChallengeUnlock(
  userId: string,
  userCoords: Coordinates,
  locationData?: LocationData
): Promise<UnlockResult[]> {
  // Record the trip first
  if (locationData) {
    await createTrip(userId, locationData);
  }

  // Fetch ALL active challenges — including those without coordinates (CONTINENT)
  const { data: challenges, error: challengeError } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true);

  if (challengeError || !challenges) {
    return [{ success: false, error: challengeError?.message ?? "Failed to load challenges." }];
  }

  const { data: existing } = await supabase
    .from("user_achievements")
    .select("challenge_id")
    .eq("user_id", userId);

  const unlockedIds = new Set(
    (existing ?? []).map((a: { challenge_id: string }) => a.challenge_id)
  );

  const incomingCountryCode = locationData?.country_code;
  const hasRealCountryCode = !!incomingCountryCode && incomingCountryCode !== "XX";

  const eligible = (challenges as Challenge[]).filter((c) => {
    if (unlockedIds.has(c.id)) return false;

    // COUNTRY challenges: match by country_code when we know it (manual check-in or
    // reverse-geocoded GPS). This avoids needing to be at a specific city coordinate.
    if (c.category === "COUNTRY" && hasRealCountryCode && c.country_code) {
      return c.country_code === incomingCountryCode;
    }

    // All other categories (WONDER, HIDDEN_GEM, MAGIC_TOWN) and COUNTRY fallback:
    // use Haversine radius check.
    if (c.latitude === null || c.longitude === null) return false;
    return isWithinRadius(
      userCoords,
      { latitude: c.latitude!, longitude: c.longitude! },
      c.radius_meters ?? 500
    );
  });

  if (eligible.length === 0) return [];

  const results: UnlockResult[] = [];
  const newlyUnlocked: Challenge[] = [];

  for (const challenge of eligible) {
    const { error: insertError } = await supabase.from("user_achievements").insert({
      id: uuidv4(),
      user_id: userId,
      challenge_id: challenge.id,
      points_at_unlock: challenge.points_value,
    });

    if (insertError) {
      results.push({ success: false, challenge_id: challenge.id, error: insertError.message });
      continue;
    }

    const { data: userRow } = await supabase
      .from("users")
      .select("total_points")
      .eq("id", userId)
      .single();

    const newTotal =
      ((userRow as { total_points: number } | null)?.total_points ?? 0) + challenge.points_value;

    await supabase
      .from("users")
      .update({ total_points: newTotal, rank: resolveRankTier(newTotal) })
      .eq("id", userId);

    results.push({
      success: true,
      challenge_id: challenge.id,
      points_earned: challenge.points_value,
      type: challenge.category as UnlockResult["type"],
      title: challenge.title,
    });

    newlyUnlocked.push(challenge as Challenge);
  }

  // Check if any continent is now fully completed
  const continentResults = await checkContinentCompletion(userId, newlyUnlocked);
  results.push(...continentResults);

  return results;
}

export async function evaluateMockUnlock(userId: string): Promise<UnlockResult[]> {
  const mockCoords: Coordinates = { latitude: 19.4326, longitude: -99.1332 };
  const mockLocation: LocationData = {
    latitude: 19.4326,
    longitude: -99.1332,
    country_code: "MX",
    country_name: "Mexico",
    city: "Mexico City",
  };
  return evaluateChallengeUnlock(userId, mockCoords, mockLocation);
}
