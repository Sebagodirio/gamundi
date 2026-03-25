import { supabase } from "./supabase";
import type { Challenge, Coordinates, UnlockResult } from "../types";

const RANK_THRESHOLDS: Record<string, number> = {
  BRONZE: 0,
  SILVER: 500,
  GOLD: 1500,
  PLATINUM: 4000,
  DIAMOND: 10000,
};

function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371000; // Earth radius in meters
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

export async function evaluateChallengeUnlock(
  userId: string,
  userCoords: Coordinates
): Promise<UnlockResult[]> {
  const { data: challenges, error: challengeError } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (challengeError || !challenges) {
    return [{ success: false, error: challengeError?.message ?? "Failed to load challenges." }];
  }

  const { data: existing } = await supabase
    .from("user_achievements")
    .select("challenge_id")
    .eq("user_id", userId);

  const unlockedIds = new Set((existing ?? []).map((a: { challenge_id: string }) => a.challenge_id));

  const eligible = (challenges as Challenge[]).filter(
    (c) =>
      !unlockedIds.has(c.id) &&
      c.latitude !== null &&
      c.longitude !== null &&
      isWithinRadius(
        userCoords,
        { latitude: c.latitude!, longitude: c.longitude! },
        c.radius_meters ?? 500
      )
  );

  if (eligible.length === 0) return [];

  const results: UnlockResult[] = [];

  for (const challenge of eligible) {
    const { error: insertError } = await supabase.from("user_achievements").insert({
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

    const newTotal = ((userRow as { total_points: number } | null)?.total_points ?? 0) + challenge.points_value;
    const newRank = resolveRankTier(newTotal);

    await supabase
      .from("users")
      .update({ total_points: newTotal, rank: newRank })
      .eq("id", userId);

    results.push({
      success: true,
      challenge_id: challenge.id,
      points_earned: challenge.points_value,
    });
  }

  return results;
}

export async function evaluateMockUnlock(
  userId: string
): Promise<UnlockResult[]> {
  const mockCoords: Coordinates = { latitude: 19.4326, longitude: -99.1332 }; // Mexico City
  return evaluateChallengeUnlock(userId, mockCoords);
}
