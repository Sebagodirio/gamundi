import { supabase } from "./supabase";
import type { ApiResponse, UserProfile } from "../types";

export async function signUp(
  email: string,
  password: string,
  username: string,
  displayName: string,
  countryCode?: string
): Promise<ApiResponse<UserProfile>> {
  // All user data is passed as metadata so the DB trigger can create the profile row.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: displayName, country_code: countryCode ?? null },
    },
  });

  if (authError || !authData.user) {
    console.error("[signUp] auth error:", authError);
    return { data: null, error: authError?.message ?? "Sign up failed." };
  }

  // If email confirmation is required there is no session yet — return success
  // without a profile; the app will redirect once the user confirms and signs in.
  if (!authData.session) {
    return { data: null, error: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authData.user.id)
    .single();

  if (profileError) {
    console.error("[signUp] profile fetch error:", profileError);
    return { data: null, error: profileError.message };
  }

  return { data: profile as UserProfile, error: null };
}

export async function signIn(
  email: string,
  password: string
): Promise<ApiResponse<UserProfile>> {
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return { data: null, error: authError?.message ?? "Sign in failed." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authData.user.id)
    .single();

  if (profileError) {
    return { data: null, error: profileError.message };
  }

  return { data: profile as UserProfile, error: null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSessionUser(): Promise<UserProfile | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", session.user.id)
    .single();

  return (data as UserProfile) ?? null;
}
