import { Text, View } from "react-native";
import { CATEGORY_ICONS } from "../../constants/theme";
import { getRankInfo } from "../../constants/ranks";
import type { RankTier, ChallengeCategory } from "../../types";

interface RankBadgeProps {
  rank: RankTier;
  size?: "sm" | "md";
}

export function RankBadge({ rank, size = "md" }: RankBadgeProps) {
  const info = getRankInfo(rank);
  const isSm = size === "sm";
  return (
    <View
      className={`flex-row items-center gap-1 rounded-full ${isSm ? "px-2 py-0.5" : "px-3 py-1.5"}`}
      style={{
        backgroundColor: `${info.color}18`,
        borderWidth: 1,
        borderColor: `${info.color}66`,
      }}
    >
      <Text style={{ fontSize: isSm ? 11 : 14 }}>{info.icon}</Text>
      <Text
        className={`font-bold ${isSm ? "text-xs" : "text-xs"}`}
        style={{ color: info.color }}
      >
        {info.label}
      </Text>
    </View>
  );
}

interface CategoryBadgeProps {
  category: ChallengeCategory;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const icon = CATEGORY_ICONS[category] ?? "📍";
  const label = category.replace("_", " ");
  return (
    <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-brand-surface border border-brand-border">
      <Text className="text-xs">{icon}</Text>
      <Text className="text-xs text-brand-muted font-medium">{label}</Text>
    </View>
  );
}
