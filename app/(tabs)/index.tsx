import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { GlobeView } from "../../src/components/map/GlobeView";
import { CheckInModal } from "../../src/components/trips/CheckInModal";
import { useChallenges } from "../../src/hooks/useChallenges";
import { useAuth } from "../../src/hooks/useAuth";
import { evaluateChallengeUnlock, evaluateMockUnlock } from "../../src/services/unlock";
import type { Coordinates, LocationData, UnlockResult } from "../../src/types";

export default function ExploreScreen() {
  const { profile } = useAuth();
  const { challenges, achievements, refresh } = useChallenges(profile?.id ?? null);
  const [recentUnlocks, setRecentUnlocks] = useState<UnlockResult[]>([]);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanEmpty, setLastScanEmpty] = useState(false);

  // Derive country codes from COUNTRY achievements for globe painting
  const unlockedCountryCodes = achievements
    .filter((a) => a.challenge?.category === "COUNTRY" && a.challenge.country_code)
    .map((a) => a.challenge!.country_code as string);

  async function handleGpsScan(): Promise<UnlockResult[]> {
    if (!profile?.id || isScanning) return [];
    setIsScanning(true);
    let results: UnlockResult[];
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const coords: Coordinates = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        // Build a basic LocationData from coordinates (reverse geocode could enhance this)
        const locationData: LocationData = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          country_code: "XX",
          country_name: "Unknown",
        };
        results = await evaluateChallengeUnlock(profile.id, coords, locationData);
      } else {
        results = await evaluateMockUnlock(profile.id);
      }
    } catch {
      results = await evaluateMockUnlock(profile.id);
    }
    const successes = results.filter((r) => r.success);
    setRecentUnlocks(successes);
    setLastScanEmpty(successes.length === 0);
    refresh();
    setIsScanning(false);
    return results;
  }

  async function handleManualCheckIn(result: {
    coordinates: Coordinates;
    locationData: LocationData;
  }) {
    setShowCheckIn(false);
    if (!profile?.id) return;
    setIsScanning(true);
    const results = await evaluateChallengeUnlock(
      profile.id,
      result.coordinates,
      result.locationData
    );
    const successes = results.filter((r) => r.success);
    setRecentUnlocks(successes);
    setLastScanEmpty(successes.length === 0);
    refresh();
    setIsScanning(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-brand-muted text-sm">Welcome back,</Text>
        <Text className="text-white font-bold text-2xl">
          {profile?.display_name ?? "Explorer"} 👋
        </Text>
      </View>

      <GlobeView
        unlockedCount={achievements.length}
        totalChallenges={challenges.length}
        unlockedCountryCodes={unlockedCountryCodes}
        onScanPress={handleGpsScan}
        onManualPress={() => { setLastScanEmpty(false); setShowCheckIn(true); }}
        recentUnlocks={recentUnlocks}
        isScanning={isScanning}
        lastScanEmpty={lastScanEmpty}
      />

      <CheckInModal
        visible={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onConfirm={handleManualCheckIn}
      />
    </SafeAreaView>
  );
}
