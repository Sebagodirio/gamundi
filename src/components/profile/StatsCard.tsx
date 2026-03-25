import { Text, View } from "react-native";
import { Card } from "../ui/Card";
import { RankBadge } from "../ui/Badge";
import type { UserProfile } from "../../types";

interface StatsCardProps {
  profile: UserProfile;
  achievementsCount: number;
}

export function StatsCard({ profile, achievementsCount }: StatsCardProps) {
  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-white font-bold text-xl">{profile.display_name}</Text>
          <Text className="text-brand-muted text-sm">@{profile.username}</Text>
        </View>
        <RankBadge rank={profile.rank} />
      </View>

      <View className="flex-row justify-between">
        <StatItem label="Points" value={profile.total_points.toLocaleString()} />
        <StatItem label="Unlocked" value={achievementsCount.toString()} />
        <StatItem label="Streak" value={`${profile.current_streak}🔥`} />
        <StatItem label="Best" value={`${profile.longest_streak}🏆`} />
      </View>
    </Card>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center">
      <Text className="text-white font-bold text-lg">{value}</Text>
      <Text className="text-brand-muted text-xs">{label}</Text>
    </View>
  );
}
