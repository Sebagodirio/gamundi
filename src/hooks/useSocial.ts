import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import type { SocialPost } from "../types";

interface SocialHookState {
  posts: SocialPost[];
  isLoading: boolean;
  refresh: () => void;
  createPost: (content: string, imageUrl?: string, locationTag?: string) => Promise<boolean>;
}

export function useSocial(userId: string | null): SocialHookState {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("social_posts")
      .select("*, user:users(username, display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts((data as SocialPost[]) ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createPost = useCallback(
    async (content: string, imageUrl?: string, locationTag?: string): Promise<boolean> => {
      if (!userId) return false;
      const { error } = await supabase.from("social_posts").insert({
        user_id: userId,
        content,
        image_url: imageUrl ?? null,
        location_tag: locationTag ?? null,
      });
      if (!error) load();
      return !error;
    },
    [userId, load]
  );

  return { posts, isLoading, refresh: load, createPost };
}
