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
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .single();
    setProfile((data as UserProfile) ?? null);
    setIsLoading(false);
  }

  return { session, profile, isLoading };
}
