import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";
import type { UserProfile } from "../types";

interface AuthHookState {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

export function useAuth(): AuthHookState {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) fetchProfile(s.user.id);
      else setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) fetchProfile(s.user.id);
      else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile(authId: string) {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .single();

    if (error?.code === "PGRST116") {
      await autoCreateProfile(authId);
      return;
    }

    if (error) console.error("[useAuth] fetchProfile error:", error);
    setProfile((data as UserProfile) ?? null);
    setIsLoading(false);
  }

  async function autoCreateProfile(authId: string) {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const meta = (authUser?.user_metadata ?? {}) as Record<string, string>;
    const fallback = "user_" + authId.slice(0, 8);

    const { data, error } = await supabase
      .from("users")
      .insert({
        auth_id: authId,
        username: meta.username || fallback,
        display_name: meta.display_name || meta.username || "Explorer",
        country_code: meta.country_code || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[useAuth] auto-create profile failed:", error);
    } else {
      console.log("[useAuth] profile auto-created from metadata");
    }

    setProfile((data as UserProfile) ?? null);
    setIsLoading(false);
  }

  return { session, profile, isLoading };
}
