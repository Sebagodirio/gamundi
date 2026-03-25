import { Text, View } from "react-native";
import { RANK_COLORS, CATEGORY_ICONS } from "../../constants/theme";
import type { RankTier, ChallengeCategory } from "../../types";

interface RankBadgeProps {
  rank: RankTier;
}

export function RankBadge({ rank }: RankBadgeProps) {
  const color = RANK_COLORS[rank] ?? "#fff";
  return (
    <View
      className="px-3 py-1 rounded-full"
      style={{ backgroundColor: `${color}22`, borderWidth: 1, borderColor: color }}
    >
      <Text className="text-xs font-bold" style={{ color }}>
        {rank}
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
