import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import type { Challenge, ChallengeCategory, UserAchievement } from "../types";

interface ChallengesHookState {
  challenges: Challenge[];
  achievements: UserAchievement[];
  isLoading: boolean;
  refresh: () => void;
}

export function useChallenges(
  userId: string | null,
  filterCategory?: ChallengeCategory
): ChallengesHookState {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);

    let query = supabase.from("challenges").select("*").eq("is_active", true);
    if (filterCategory) query = query.eq("category", filterCategory);

    const { data: ch } = await query.order("points_value", { ascending: false });
    setChallenges((ch as Challenge[]) ?? []);

    if (userId) {
      const { data: ua } = await supabase
        .from("user_achievements")
        .select("*, challenge:challenges(*)")
        .eq("user_id", userId);
      setAchievements((ua as UserAchievement[]) ?? []);
    }

    setIsLoading(false);
  }, [userId, filterCategory]);

  useEffect(() => {
    load();
  }, [load]);

  return { challenges, achievements, isLoading, refresh: load };
}
