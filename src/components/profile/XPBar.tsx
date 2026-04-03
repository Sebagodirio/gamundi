import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { getRankInfo, getNextRank, getXPProgress, pointsToNextRank } from "../../constants/ranks";
import type { RankTier } from "../../types";

interface XPBarProps {
  points: number;
  rank: RankTier;
}

export function XPBar({ points, rank }: XPBarProps) {
  const info = getRankInfo(rank);
  const next = getNextRank(rank);
  const progress = getXPProgress(points, rank);
  const toNext = pointsToNextRank(points, rank);

  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  if (!next) {
    return (
      <View className="items-center mt-1">
        <Text className="text-xs font-bold" style={{ color: info.color }}>
          {info.icon} Rango máximo alcanzado
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full px-6 mt-3">
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-xs text-brand-muted">
          {info.icon} {info.label}
        </Text>
        <Text className="text-xs text-brand-muted">
          {next.icon} {next.label}
        </Text>
      </View>

      {/* Track */}
      <View
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: `${info.color}22` }}
      >
        <Animated.View
          className="h-full rounded-full"
          style={[{ backgroundColor: info.color }, barStyle]}
        />
      </View>

      <Text className="text-xs text-brand-muted text-center mt-1.5">
        {toNext.toLocaleString()} pts para{" "}
        <Text style={{ color: next.color }}>{next.label}</Text>
      </Text>
    </View>
  );
}
