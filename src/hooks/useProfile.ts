import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import type { LeaderboardEntry, UserProfile } from "../types";

interface ProfileHookState {
  profile: UserProfile | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  refresh: () => void;
}

export function useProfile(userId: string | null): ProfileHookState {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    const [{ data: profileData }, { data: topUsers }] = await Promise.all([
      supabase.from("users").select("*").eq("id", userId).single(),
      supabase
        .from("users")
        .select("id, username, display_name, avatar_url, total_points, rank")
        .order("total_points", { ascending: false })
        .limit(100),
    ]);

    setProfile((profileData as UserProfile) ?? null);

    const entries: LeaderboardEntry[] = ((topUsers ?? []) as UserProfile[]).map(
      (u, i) => ({
        rank_position: i + 1,
        user: {
          id: u.id,
          username: u.username,
          display_name: u.display_name,
          avatar_url: u.avatar_url,
          total_points: u.total_points,
          rank: u.rank,
        },
      })
    );
    setLeaderboard(entries);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, leaderboard, isLoading, refresh: load };
}
