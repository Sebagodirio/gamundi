import { useCallback, useEffect, useState } from "react";
import { createTrip, getUserTrips } from "../services/trips";
import type { Trip, LocationData } from "../types";

interface TripsHookState {
  trips: Trip[];
  isLoading: boolean;
  logTrip: (locationData: LocationData) => Promise<Trip | null>;
  refresh: () => void;
}

export function useTrips(userId: string | null): TripsHookState {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const data = await getUserTrips(userId);
    setTrips(data);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const logTrip = useCallback(
    async (locationData: LocationData): Promise<Trip | null> => {
      if (!userId) return null;
      const trip = await createTrip(userId, locationData);
      if (trip) setTrips((prev) => [trip, ...prev]);
      return trip;
    },
    [userId]
  );

  return { trips, isLoading, logTrip, refresh: load };
}
