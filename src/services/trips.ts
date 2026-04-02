import { supabase } from "./supabase";
import type { Trip, LocationData } from "../types";

// Prisma @default(uuid()) is client-side only; generate UUID here for raw Supabase inserts.
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function createTrip(
  userId: string,
  locationData: LocationData
): Promise<Trip | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("trips")
    .insert({
      id: uuidv4(),
      user_id: userId,
      title: locationData.city
        ? `${locationData.city}, ${locationData.country_name}`
        : locationData.country_name,
      location_data: locationData,
      started_at: now,
    })
    .select()
    .single();

  if (error) {
    console.warn("createTrip error:", error.message);
    return null;
  }

  return data as Trip;
}

export async function getUserTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (error) {
    console.warn("getUserTrips error:", error.message);
    return [];
  }

  return (data as Trip[]) ?? [];
}
