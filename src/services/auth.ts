import { supabase } from "./supabase";
import type { ApiResponse, UserProfile } from "../types";

export async function signUp(
  email: string,
  password: string,
  username: string,
  displayName: string
): Promise<ApiResponse<UserProfile>> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: displayName },
    },
  });

  if (authError || !authData.user) {
    return { data: null, error: authError?.message ?? "Sign up failed." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .insert({
      auth_id: authData.user.id,
      username,
      display_name: displayName,
    })
    .select()
    .single();

  if (profileError) {
    return { data: null, error: profileError.message };
  }

  return { data: profile as UserProfile, error: null };
}

export async function signIn(
  email: string,
  password: string
): Promise<ApiResponse<UserProfile>> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

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
