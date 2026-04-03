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
import { CollectionCard } from "../../src/components/profile/CollectionCard";
import { TravelStats } from "../../src/components/profile/TravelStats";
import { XPBar } from "../../src/components/profile/XPBar";
import { RankBadge } from "../../src/components/ui/Badge";
import { useAuth } from "../../src/hooks/useAuth";
import { useChallenges } from "../../src/hooks/useChallenges";
import { useProfile } from "../../src/hooks/useProfile";
import { useTravelStats } from "../../src/hooks/useTravelStats";
import { useI18n } from "../../src/i18n";
import { signOut } from "../../src/services/auth";
import { COLORS, RANK_COLORS } from "../../src/constants/theme";
import { COUNTRIES, getFlagEmoji } from "../../src/constants/countries";
import { getRankInfo } from "../../src/constants/ranks";
import { computeCollections } from "../../src/constants/collections";
import type { LeaderboardEntry, UserAchievement } from "../../src/types";

type ProfileTab = "achievements" | "collections" | "stats" | "leaderboard";

const TABS: Array<{ key: ProfileTab; label: string; icon: string }> = [
  { key: "achievements", label: "Logros", icon: "🏅" },
  { key: "collections", label: "Colecciones", icon: "🎯" },
  { key: "stats", label: "Estadísticas", icon: "📊" },
  { key: "leaderboard", label: "Ranking", icon: "🏆" },
];

function Avatar({ name, rank }: { name: string; rank: string }) {
  const info = getRankInfo(rank as any);
  return (
    <View
      className="w-20 h-20 rounded-full items-center justify-center mb-3"
      style={{
        backgroundColor: `${info.color}22`,
        borderWidth: 2,
        borderColor: `${info.color}66`,
      }}
    >
      <Text className="text-white font-bold text-2xl">
        {name
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() ?? "")
          .join("")}
      </Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-3 border-b border-brand-border">
      <Text className="text-base w-7">{icon}</Text>
      <Text className="text-brand-muted text-sm w-28">{label}</Text>
      <Text className="text-white text-sm flex-1 text-right">{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { t } = useI18n();
  const { profile: authProfile, session, isLoading: authLoading } = useAuth();
  const { profile, leaderboard, isLoading, refresh } = useProfile(authProfile?.id ?? null);
  const { challenges, achievements } = useChallenges(authProfile?.id ?? null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("achievements");

  const stats = useTravelStats(
    achievements,
    challenges,
    profile?.total_points ?? 0
  );

  const collections = computeCollections(
    challenges,
    new Set(achievements.map((a) => a.challenge_id))
  );

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
    ? new Date(profile.created_at).toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      })
    : "—";

  if (authLoading || (authProfile && !profile && isLoading)) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center">
        <Text className="text-brand-muted">Cargando…</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center px-8">
        <Text className="text-4xl mb-4">⚠️</Text>
        <Text className="text-white font-bold text-lg text-center mb-2">
          Perfil no encontrado
        </Text>
        <Text className="text-brand-muted text-xs text-center mb-8">
          auth_id: {session?.user?.id ?? "—"}
        </Text>
        <Pressable
          onPress={signOut}
          className="px-6 py-3 rounded-xl border border-red-500/30 bg-red-950/40"
        >
          <Text className="text-red-400 font-semibold">Cerrar sesión</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ── Profile header (shared across all tabs) ────────────────────────────
  const Header = (
    <View>
      {/* Hero */}
      <View className="items-center pt-6 pb-2 px-5">
        <Avatar name={profile.display_name} rank={profile.rank} />
        <Text className="text-white font-bold text-2xl">{profile.display_name}</Text>
        <View className="flex-row items-center gap-2 mt-1 mb-3">
          <Text className="text-brand-muted text-sm">@{profile.username}</Text>
          {country && <Text className="text-sm">{getFlagEmoji(country.code)}</Text>}
        </View>
        <RankBadge rank={profile.rank} />
        <XPBar points={profile.total_points} rank={profile.rank} />
      </View>

      {/* Stats strip */}
      <View
        className="mx-5 rounded-2xl border border-brand-border flex-row justify-between px-4 py-4 mb-4 mt-4"
        style={{ backgroundColor: COLORS.surface }}
      >
        {[
          { label: "Puntos", value: profile.total_points.toLocaleString() },
          { label: "Logros", value: achievements.length.toString() },
          { label: "Racha", value: `${profile.current_streak}🔥` },
          { label: "Récord", value: `${profile.longest_streak}🏆` },
        ].map(({ label, value }) => (
          <View key={label} className="items-center">
            <Text className="text-white font-bold text-lg">{value}</Text>
            <Text className="text-brand-muted text-xs">{label}</Text>
          </View>
        ))}
      </View>

      {/* Account info (collapsed by default under stats) */}
      <View
        className="mx-5 rounded-2xl border border-brand-border px-4 mb-4 overflow-hidden"
        style={{ backgroundColor: COLORS.surface }}
      >
        <Text className="text-brand-muted text-xs font-semibold uppercase tracking-widest pt-3 pb-1">
          Cuenta
        </Text>
        <InfoRow icon="✉️" label="Correo" value={session?.user?.email ?? "—"} />
        <InfoRow
          icon="🌍"
          label="País"
          value={country ? `${getFlagEmoji(country.code)} ${country.nameEs}` : "—"}
        />
        <InfoRow icon="📅" label="Miembro desde" value={joinedDate} />
        <View className="py-3">
          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center justify-center py-3 rounded-xl border border-red-500/30 bg-red-950/40"
          >
            <Text className="text-red-400 font-semibold text-sm">Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mx-5 mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl border flex-row items-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-brand-primary border-brand-primary"
                : "bg-brand-surface border-brand-border"
            }`}
          >
            <Text style={{ fontSize: 14 }}>{tab.icon}</Text>
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab.key ? "text-white" : "text-brand-muted"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  // ── Achievements tab ───────────────────────────────────────────────────
  if (activeTab === "achievements") {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={["top"]}>
        <FlatList<UserAchievement>
          ListHeaderComponent={Header}
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
            <View className="items-center px-8 py-12">
              <Text style={{ fontSize: 48 }}>🔒</Text>
              <Text className="text-white font-bold text-lg mt-3 text-center">
                Sin logros aún
              </Text>
              <Text className="text-brand-muted text-sm text-center mt-1">
                Registra tu primer viaje para desbloquear logros.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // ── Collections tab ────────────────────────────────────────────────────
  if (activeTab === "collections") {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={["top"]}>
        <FlatList
          ListHeaderComponent={Header}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          data={collections}
          keyExtractor={(item) => item.def.id}
          renderItem={({ item }) => <CollectionCard collection={item} />}
          ListEmptyComponent={
            <Text className="text-brand-muted text-center mt-8">
              No hay colecciones disponibles.
            </Text>
          }
        />
      </SafeAreaView>
    );
  }

  // ── Stats tab ──────────────────────────────────────────────────────────
  if (activeTab === "stats") {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={["top"]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {Header}
          <TravelStats stats={stats} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Leaderboard tab ────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={["top"]}>
      <FlatList<LeaderboardEntry>
        ListHeaderComponent={Header}
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
            El ranking está vacío.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
