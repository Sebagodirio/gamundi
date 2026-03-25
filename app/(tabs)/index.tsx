import { useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import * as Location from "expo-location";
import { GlobeView } from "../../src/components/map/GlobeView";
import { useChallenges } from "../../src/hooks/useChallenges";
import { useAuth } from "../../src/hooks/useAuth";
import { evaluateChallengeUnlock, evaluateMockUnlock } from "../../src/services/unlock";
import type { UnlockResult } from "../../src/types";

export default function ExploreScreen() {
  const { profile } = useAuth();
  const { challenges, achievements, refresh } = useChallenges(profile?.id ?? null);
  const [recentUnlocks, setRecentUnlocks] = useState<UnlockResult[]>([]);

  async function handleScan(): Promise<UnlockResult[]> {
    if (!profile?.id) return [];

    const { status } = await Location.requestForegroundPermissionsAsync();

    let results: UnlockResult[];

    if (status === "granted") {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      results = await evaluateChallengeUnlock(profile.id, {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } else {
      results = await evaluateMockUnlock(profile.id);
    }

    setRecentUnlocks(results);
    refresh();
    return results;
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
        onScanPress={handleScan}
        recentUnlocks={recentUnlocks}
      />
    </SafeAreaView>
  );
}
