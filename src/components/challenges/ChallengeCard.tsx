import { Text, View } from "react-native";
import { Card } from "../ui/Card";
import { CategoryBadge } from "../ui/Badge";
import type { Challenge, UserAchievement } from "../../types";
import { CATEGORY_ICONS } from "../../constants/theme";

interface ChallengeCardProps {
  challenge: Challenge;
  achievement?: UserAchievement;
}

export function ChallengeCard({ challenge, achievement }: ChallengeCardProps) {
  const isUnlocked = !!achievement;
  const icon = CATEGORY_ICONS[challenge.category] ?? "📍";

  return (
    <Card className={`mb-3 ${isUnlocked ? "opacity-100" : "opacity-70"}`}>
      <View className="flex-row items-start gap-3">
        <View
          className={`w-12 h-12 rounded-xl items-center justify-center ${
            isUnlocked ? "bg-brand-accent/20" : "bg-brand-surface"
          }`}
        >
          <Text className="text-2xl">{isUnlocked ? icon : "🔒"}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-semibold text-base" numberOfLines={1}>
            {challenge.title}
          </Text>
          <Text className="text-brand-muted text-sm mt-0.5" numberOfLines={2}>
            {challenge.description}
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <CategoryBadge category={challenge.category} />
            <View className="px-2 py-1 rounded-full bg-brand-primary/20 border border-brand-primary/40">
              <Text className="text-xs text-brand-primary font-bold">
                +{challenge.points_value} pts
              </Text>
            </View>
          </View>
        </View>
        {isUnlocked && (
          <View className="w-6 h-6 rounded-full bg-brand-accent items-center justify-center">
            <Text className="text-xs text-brand-dark font-bold">✓</Text>
          </View>
        )}
      </View>
    </Card>
  );
}
