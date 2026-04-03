import { View, Text } from "react-native";
import type { TravelStats } from "../../hooks/useTravelStats";
import { COLORS } from "../../constants/theme";

interface TravelStatsProps {
  stats: TravelStats;
}

function StatCard({
  emoji,
  value,
  label,
  accent,
}: {
  emoji: string;
  value: string;
  label: string;
  accent?: string;
}) {
  return (
    <View
      className="flex-1 rounded-2xl border border-brand-border p-4 items-center"
      style={{ backgroundColor: COLORS.surface }}
    >
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Text
        className="font-bold text-xl mt-1"
        style={{ color: accent ?? "#fff" }}
      >
        {value}
      </Text>
      <Text className="text-brand-muted text-xs text-center mt-0.5">{label}</Text>
    </View>
  );
}

function InsightRow({
  icon,
  text,
  highlight,
}: {
  icon: string;
  text: string;
  highlight?: string;
}) {
  if (!highlight) {
    return (
      <View className="flex-row items-start gap-3 py-3 border-b border-brand-border">
        <Text className="text-lg w-7">{icon}</Text>
        <Text className="text-brand-muted text-sm flex-1">{text}</Text>
      </View>
    );
  }
  // Split text around highlight
  const parts = text.split(highlight);
  return (
    <View className="flex-row items-start gap-3 py-3 border-b border-brand-border">
      <Text className="text-lg w-7">{icon}</Text>
      <Text className="text-brand-muted text-sm flex-1">
        {parts[0]}
        <Text className="text-white font-semibold">{highlight}</Text>
        {parts[1]}
      </Text>
    </View>
  );
}

export function TravelStats({ stats }: TravelStatsProps) {
  const hasStats = stats.countriesVisited > 0 || stats.wondersVisited > 0;

  if (!hasStats) {
    return (
      <View className="flex-1 items-center justify-center px-8 py-16">
        <Text style={{ fontSize: 56 }}>🗺️</Text>
        <Text className="text-white font-bold text-xl mt-4 text-center">
          Tu aventura empieza aquí
        </Text>
        <Text className="text-brand-muted text-sm text-center mt-2 leading-relaxed">
          Registra tu primer destino para ver tus estadísticas de viaje.
        </Text>
      </View>
    );
  }

  return (
    <View className="px-5 pb-8">
      {/* Hero stat */}
      <View
        className="rounded-2xl border border-brand-border p-5 mb-4 items-center"
        style={{ backgroundColor: COLORS.surface }}
      >
        <Text className="text-brand-muted text-sm mb-1">Has explorado</Text>
        <Text className="text-white font-bold" style={{ fontSize: 52, lineHeight: 60 }}>
          {stats.worldPercent}
          <Text style={{ fontSize: 28, color: COLORS.muted }}>%</Text>
        </Text>
        <Text className="text-brand-muted text-sm">del mundo</Text>
        <View className="w-full h-2 rounded-full overflow-hidden mt-3" style={{ backgroundColor: "#2A2A4A" }}>
          <View
            className="h-full rounded-full"
            style={{ width: `${Math.max(stats.worldPercent, 1)}%`, backgroundColor: COLORS.primary }}
          />
        </View>
        <Text className="text-brand-muted text-xs mt-2">
          {stats.countriesVisited} de {stats.totalCountryChallenges} países disponibles
        </Text>
      </View>

      {/* 2×2 grid */}
      <View className="flex-row gap-3 mb-3">
        <StatCard
          emoji="🌍"
          value={stats.countriesVisited.toString()}
          label="Países"
          accent={COLORS.primary}
        />
        <StatCard
          emoji="🏛️"
          value={stats.wondersVisited.toString()}
          label="Maravillas"
          accent="#FFD700"
        />
      </View>
      <View className="flex-row gap-3 mb-4">
        <StatCard
          emoji="💎"
          value={stats.hiddenGemsVisited.toString()}
          label="Joyas ocultas"
          accent="#F472B6"
        />
        <StatCard
          emoji="✨"
          value={stats.magicTownsVisited.toString()}
          label="Pueblos mágicos"
          accent="#A78BFA"
        />
      </View>

      {/* Insights */}
      <View
        className="rounded-2xl border border-brand-border px-4 mb-4 overflow-hidden"
        style={{ backgroundColor: COLORS.surface }}
      >
        <Text className="text-brand-muted text-xs font-semibold uppercase tracking-widest pt-3 pb-1">
          Insights de viaje
        </Text>

        {stats.favoriteContinent && (
          <InsightRow
            icon="❤️"
            text={`Tu continente favorito es ${stats.favoriteContinent} con ${stats.favoriteContinentCount} destinos visitados.`}
            highlight={stats.favoriteContinent}
          />
        )}

        <InsightRow
          icon="🌐"
          text={`Has pisado ${stats.continentsVisited} de 6 continentes.`}
          highlight={`${stats.continentsVisited} de 6 continentes`}
        />

        {stats.topChallenge && (
          <InsightRow
            icon="🏅"
            text={`Tu logro más valioso es ${stats.topChallenge.title} con ${stats.topChallenge.points_value} puntos.`}
            highlight={stats.topChallenge.title}
          />
        )}

        <InsightRow
          icon="📊"
          text={`Has acumulado ${stats.totalPoints.toLocaleString()} puntos de experiencia.`}
          highlight={stats.totalPoints.toLocaleString()}
        />
      </View>

      {/* Continent breakdown */}
      {stats.continentBreakdown.length > 0 && (
        <View
          className="rounded-2xl border border-brand-border px-4 overflow-hidden"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text className="text-brand-muted text-xs font-semibold uppercase tracking-widest pt-3 pb-2">
            Por continente
          </Text>
          {stats.continentBreakdown.map(({ code, name, count }) => (
            <View
              key={code}
              className="flex-row items-center py-2.5 border-b border-brand-border/60"
            >
              <Text className="text-white text-sm flex-1 font-medium">{name}</Text>
              <View className="flex-row items-center gap-2">
                <View
                  className="h-1.5 rounded-full"
                  style={{
                    width: Math.max(count * 14, 8),
                    backgroundColor: COLORS.primary,
                    opacity: 0.7,
                  }}
                />
                <Text className="text-brand-muted text-xs w-8 text-right">
                  {count}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
