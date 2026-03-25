import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChallengeCard } from "../../src/components/challenges/ChallengeCard";
import { useChallenges } from "../../src/hooks/useChallenges";
import { useAuth } from "../../src/hooks/useAuth";
import type { ChallengeCategory } from "../../src/types";
import { CATEGORY_ICONS } from "../../src/constants/theme";

const CATEGORIES: Array<{ key: ChallengeCategory | "ALL"; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "COUNTRY", label: `${CATEGORY_ICONS.COUNTRY} Countries` },
  { key: "WONDER", label: `${CATEGORY_ICONS.WONDER} Wonders` },
  { key: "HIDDEN_GEM", label: `${CATEGORY_ICONS.HIDDEN_GEM} Gems` },
  { key: "MAGIC_TOWN", label: `${CATEGORY_ICONS.MAGIC_TOWN} Magic Towns` },
];

export default function ChallengesScreen() {
  const { profile } = useAuth();
  const [filter, setFilter] = useState<ChallengeCategory | "ALL">("ALL");

  const { challenges, achievements, isLoading, refresh } = useChallenges(
    profile?.id ?? null,
    filter === "ALL" ? undefined : filter
  );

  const achievementsMap = new Map(achievements.map((a) => [a.challenge_id, a]));

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-white font-bold text-2xl">Challenges</Text>
        <Text className="text-brand-muted text-sm mt-1">
          {achievements.length} / {challenges.length} unlocked
        </Text>
      </View>

      <View className="px-5 mb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.key)}
              className={`mr-2 px-4 py-2 rounded-full border ${
                filter === item.key
                  ? "bg-brand-primary border-brand-primary"
                  : "bg-brand-surface border-brand-border"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  filter === item.key ? "text-white" : "text-brand-muted"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        contentContainerClassName="px-5 pb-8"
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChallengeCard challenge={item} achievement={achievementsMap.get(item.id)} />
        )}
        refreshing={isLoading}
        onRefresh={refresh}
        ListEmptyComponent={
          <Text className="text-brand-muted text-center mt-12">No challenges found.</Text>
        }
      />
    </SafeAreaView>
  );
}
