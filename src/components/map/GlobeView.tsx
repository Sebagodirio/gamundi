import { Text, View, Pressable } from "react-native";
import type { UnlockResult } from "../../types";

interface GlobeViewProps {
  unlockedCount: number;
  totalChallenges: number;
  onScanPress: () => Promise<UnlockResult[]>;
  recentUnlocks: UnlockResult[];
}

export function GlobeView({
  unlockedCount,
  totalChallenges,
  onScanPress,
  recentUnlocks,
}: GlobeViewProps) {
  const percentage =
    totalChallenges > 0
      ? Math.round((unlockedCount / totalChallenges) * 100)
      : 0;

  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Globe placeholder — replace with react-native-maps or three-globe */}
      <View className="w-64 h-64 rounded-full bg-brand-surface border-2 border-brand-primary items-center justify-center mb-8 shadow-lg">
        <Text className="text-7xl">🌍</Text>
        <Text className="text-white font-bold text-2xl mt-2">{percentage}%</Text>
        <Text className="text-brand-muted text-sm">Explored</Text>
      </View>

      <View className="flex-row gap-8 mb-8">
        <View className="items-center">
          <Text className="text-white font-bold text-2xl">{unlockedCount}</Text>
          <Text className="text-brand-muted text-xs">Unlocked</Text>
        </View>
        <View className="items-center">
          <Text className="text-white font-bold text-2xl">{totalChallenges}</Text>
          <Text className="text-brand-muted text-xs">Total</Text>
        </View>
      </View>

      <Pressable
        onPress={onScanPress}
        className="bg-brand-primary px-8 py-4 rounded-2xl active:opacity-80 shadow-md"
      >
        <Text className="text-white font-bold text-base">📍 Scan Location</Text>
      </Pressable>

      {recentUnlocks.length > 0 && (
        <View className="mt-6 w-full">
          {recentUnlocks.map((r, i) =>
            r.success ? (
              <View
                key={i}
                className="bg-brand-accent/20 border border-brand-accent/50 rounded-xl px-4 py-3 mb-2"
              >
                <Text className="text-brand-accent font-semibold text-sm">
                  🎉 Achievement unlocked! +{r.points_earned} pts
                </Text>
              </View>
            ) : null
          )}
        </View>
      )}
    </View>
  );
}
