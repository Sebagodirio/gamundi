import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChallengeCard } from "../../src/components/challenges/ChallengeCard";
import { LeaderboardRow } from "../../src/components/profile/LeaderboardRow";
import { RankBadge } from "../../src/components/ui/Badge";
import { useAuth } from "../../src/hooks/useAuth";
import { useChallenges } from "../../src/hooks/useChallenges";
import { useProfile } from "../../src/hooks/useProfile";
import { useI18n } from "../../src/i18n";
import { signOut } from "../../src/services/auth";
import { COLORS, RANK_COLORS } from "../../src/constants/theme";
import { COUNTRIES, getFlagEmoji } from "../../src/constants/countries";
import type { LeaderboardEntry, UserAchievement } from "../../src/types";

type ProfileTab = "achievements" | "leaderboard";

function Avatar({ name, rank }: { name: string; rank: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const color = RANK_COLORS[rank] ?? COLORS.primary;
  return (
    <View
      className="w-20 h-20 rounded-full items-center justify-center mb-3"
      style={{ backgroundColor: `${color}22`, borderWidth: 2, borderColor: `${color}66` }}
    >
      <Text className="text-white font-bold text-2xl">{initials}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-3 border-b border-brand-border">
      <Text className="text-base w-7">{icon}</Text>
      <Text className="text-brand-muted text-sm w-24">{label}</Text>
      <Text className="text-white text-sm flex-1 text-right">{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { t } = useI18n();
  const { profile: authProfile, session, isLoading: authLoading } = useAuth();
  const { profile, leaderboard, isLoading, refresh } = useProfile(authProfile?.id ?? null);
  const { achievements } = useChallenges(authProfile?.id ?? null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("achievements");

  function handleSignOut() {
    Alert.alert(t("profile.signOut"), t("profile.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("profile.signOut"), style: "destructive", onPress: signOut },
    ]);
  }

  const country = profile?.country_code
    ? COUNTRIES.find((c) => c.code === profile.country_code)
    : null;

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "—";

  if (authLoading || (authProfile && !profile && isLoading)) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center">
        <Text className="text-brand-muted">Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    // Profile row missing — account exists in auth but not in users table.
    // This happens when a user signed up before the DB trigger was configured.
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center px-8">
        <Text className="text-4xl mb-4">⚠️</Text>
        <Text className="text-white font-bold text-lg text-center mb-2">
          Profile not found
        </Text>
        <Text className="text-brand-muted text-sm text-center mb-2">
          Your account exists but no profile row was created.
        </Text>
        <Text className="text-brand-muted text-xs text-center mb-8">
          auth_id: {session?.user?.id ?? "—"}
        </Text>
        <Pressable
          onPress={signOut}
          className="px-6 py-3 rounded-xl border border-red-500/30 bg-red-950/40"
        >
          <Text className="text-red-400 font-semibold">Sign Out</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const ListHeader = (
    <View>
      {/* Hero */}
      <View className="items-center pt-6 pb-4 px-5">
        <Avatar name={profile.display_name} rank={profile.rank} />
        <Text className="text-white font-bold text-2xl">{profile.display_name}</Text>
        <View className="flex-row items-center gap-2 mt-1">
          <Text className="text-brand-muted text-sm">@{profile.username}</Text>
          {country && (
            <Text className="text-sm">{getFlagEmoji(country.code)}</Text>
          )}
        </View>
        <View className="mt-2">
          <RankBadge rank={profile.rank} />
        </View>
      </View>

      {/* Stats */}
      <View
        className="mx-5 rounded-2xl border border-brand-border flex-row justify-between px-5 py-4 mb-4"
        style={{ backgroundColor: COLORS.surface }}
      >
        {[
          { label: t("profile.points"), value: profile.total_points.toLocaleString() },
          { label: t("profile.unlocked"), value: achievements.length.toString() },
          { label: t("profile.streak"), value: `${profile.current_streak}🔥` },
          { label: t("profile.best"), value: `${profile.longest_streak}🏆` },
        ].map(({ label, value }) => (
          <View key={label} className="items-center">
            <Text className="text-white font-bold text-lg">{value}</Text>
            <Text className="text-brand-muted text-xs">{label}</Text>
          </View>
        ))}
      </View>

      {/* Account info */}
      <View
        className="mx-5 rounded-2xl border border-brand-border px-4 mb-4 overflow-hidden"
        style={{ backgroundColor: COLORS.surface }}
      >
        <Text className="text-brand-muted text-xs font-semibold uppercase tracking-widest pt-3 pb-1">
          {t("profile.account")}
        </Text>
        <InfoRow icon="✉️" label={t("profile.email")} value={session?.user?.email ?? "—"} />
        <InfoRow
          icon="🌍"
          label={t("profile.country")}
          value={
            country
              ? `${getFlagEmoji(country.code)} ${country.nameEn}`
              : "—"
          }
        />
        <InfoRow icon="📅" label={t("profile.memberSince")} value={joinedDate} />
        <View className="py-3">
          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center justify-center py-3 rounded-xl border border-red-500/30 bg-red-950/40"
          >
            <Text className="text-red-400 font-semibold text-sm">
              {t("profile.signOut")}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <View className="mx-5 flex-row mb-4 bg-brand-surface rounded-xl p-1 border border-brand-border">
        {(["achievements", "leaderboard"] as ProfileTab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === tab ? "bg-brand-primary" : ""}`}
          >
            <Text
              className={`text-sm font-semibold ${activeTab === tab ? "text-white" : "text-brand-muted"}`}
            >
              {tab === "achievements"
                ? `🏅 ${t("profile.tabs.achievements")}`
                : `🏆 ${t("profile.tabs.rankings")}`}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  if (activeTab === "achievements") {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={["top"]}>
        <FlatList<UserAchievement>
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 32 }}
          data={achievements}
          keyExtractor={(item) => item.id}
          refreshing={isLoading}
          onRefresh={refresh}
          renderItem={({ item }) => (
            <View className="px-5">
              <ChallengeCard challenge={item.challenge!} achievement={item} />
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-brand-muted text-center mt-6 px-5">
              {t("profile.empty.achievements")}
            </Text>
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={["top"]}>
      <FlatList<LeaderboardEntry>
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 32 }}
        data={leaderboard}
        keyExtractor={(item) => item.rank_position.toString()}
        refreshing={isLoading}
        onRefresh={refresh}
        renderItem={({ item }) => (
          <View className="px-5">
            <LeaderboardRow
              entry={item}
              isCurrentUser={item.user.id === authProfile?.id}
            />
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-brand-muted text-center mt-6 px-5">
            {t("profile.empty.leaderboard")}
          </Text>
        }
      />
    </SafeAreaView>
  );
}
