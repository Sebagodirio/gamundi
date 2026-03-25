import { FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import { useState } from "react";
import { StatsCard } from "../../src/components/profile/StatsCard";
import { LeaderboardRow } from "../../src/components/profile/LeaderboardRow";
import { ChallengeCard } from "../../src/components/challenges/ChallengeCard";
import { useProfile } from "../../src/hooks/useProfile";
import { useChallenges } from "../../src/hooks/useChallenges";
import { useAuth } from "../../src/hooks/useAuth";
import { signOut } from "../../src/services/auth";
import type { LeaderboardEntry, UserAchievement } from "../../src/types";

type ProfileTab = "achievements" | "leaderboard";

export default function ProfileScreen() {
  const { profile: authProfile } = useAuth();
  const { profile, leaderboard, isLoading, refresh } = useProfile(authProfile?.id ?? null);
  const { achievements } = useChallenges(authProfile?.id ?? null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("achievements");

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center">
        <Text className="text-brand-muted">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <Text className="text-white font-bold text-2xl">Profile</Text>
        <Pressable
          onPress={signOut}
          className="px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border"
        >
          <Text className="text-brand-muted text-sm">Sign Out</Text>
        </Pressable>
      </View>

      <View className="px-5 mb-3">
        <StatsCard profile={profile} achievementsCount={achievements.length} />

        <View className="flex-row mb-4 bg-brand-surface rounded-xl p-1 border border-brand-border">
          {(["achievements", "leaderboard"] as ProfileTab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                activeTab === tab ? "bg-brand-primary" : ""
              }`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  activeTab === tab ? "text-white" : "text-brand-muted"
                }`}
              >
                {tab === "achievements" ? "🏅 Achievements" : "🏆 Rankings"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {activeTab === "achievements" ? (
        <FlatList<UserAchievement>
          contentContainerClassName="px-5 pb-8"
          data={achievements}
          keyExtractor={(item) => item.id}
          refreshing={isLoading}
          onRefresh={refresh}
          renderItem={({ item }) => (
            <ChallengeCard
              challenge={item.challenge!}
              achievement={item}
            />
          )}
          ListEmptyComponent={
            <Text className="text-brand-muted text-center mt-8">
              No achievements yet. Start exploring!
            </Text>
          }
        />
      ) : (
        <FlatList<LeaderboardEntry>
          contentContainerClassName="px-5 pb-8"
          data={leaderboard}
          keyExtractor={(item) => item.rank_position.toString()}
          refreshing={isLoading}
          onRefresh={refresh}
          renderItem={({ item }) => (
            <LeaderboardRow
              entry={item}
              isCurrentUser={item.user.id === authProfile?.id}
            />
          )}
          ListEmptyComponent={
            <Text className="text-brand-muted text-center mt-8">
              Leaderboard is empty.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
