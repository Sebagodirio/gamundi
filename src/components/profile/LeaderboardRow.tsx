import { Text, View } from "react-native";
import { RANK_COLORS } from "../../constants/theme";
import type { LeaderboardEntry } from "../../types";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}

const POSITION_ICONS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
  const { rank_position, user } = entry;
  const rankColor = RANK_COLORS[user.rank] ?? "#fff";
  const posIcon = POSITION_ICONS[rank_position] ?? `#${rank_position}`;

  return (
    <View
      className={`flex-row items-center px-4 py-3 rounded-xl mb-2 border ${
        isCurrentUser
          ? "bg-brand-primary/20 border-brand-primary/50"
          : "bg-brand-card border-brand-border"
      }`}
    >
      <Text className="text-base w-8">{posIcon}</Text>
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${rankColor}33` }}
      >
        <Text className="text-xs font-bold" style={{ color: rankColor }}>
          {user.display_name.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold text-sm">
          {user.display_name}
          {isCurrentUser ? " (you)" : ""}
        </Text>
        <Text className="text-brand-muted text-xs">@{user.username}</Text>
      </View>
      <Text className="text-brand-accent font-bold text-sm">
        {user.total_points.toLocaleString()} pts
      </Text>
    </View>
  );
}
