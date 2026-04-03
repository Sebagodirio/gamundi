import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { CollectionProgress } from "../../constants/collections";
import { CATEGORY_ICONS } from "../../constants/theme";

interface CollectionCardProps {
  collection: CollectionProgress;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const { def, total, unlocked, isComplete, challenges, unlockedIds } = collection;
  const [expanded, setExpanded] = useState(false);
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <View
      className="mb-3 rounded-2xl border overflow-hidden"
      style={{ borderColor: isComplete ? `${def.color}66` : "#2A2A4A" }}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="px-4 py-4"
        style={{ backgroundColor: isComplete ? `${def.color}12` : "#1A1A2E" }}
      >
        {/* Header row */}
        <View className="flex-row items-center gap-3">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${def.color}22` }}
          >
            <Text style={{ fontSize: 24 }}>{def.icon}</Text>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-bold text-base flex-1" numberOfLines={1}>
                {def.title}
              </Text>
              {isComplete && (
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${def.color}33` }}
                >
                  <Text className="text-xs font-bold" style={{ color: def.color }}>
                    ✓ Completo
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-brand-muted text-xs mt-0.5" numberOfLines={1}>
              {def.subtitle}
            </Text>

            {/* Progress bar */}
            <View className="mt-2 flex-row items-center gap-2">
              <View
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: "#2A2A4A" }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: def.color,
                  }}
                />
              </View>
              <Text className="text-xs font-semibold" style={{ color: def.color }}>
                {unlocked}/{total}
              </Text>
            </View>
          </View>

          <Text className="text-brand-muted text-base ml-1">
            {expanded ? "▲" : "▼"}
          </Text>
        </View>
      </Pressable>

      {/* Expanded list */}
      {expanded && (
        <View className="px-4 pb-4 pt-1 border-t border-brand-border">
          {challenges.map((c) => {
            const done = unlockedIds.has(c.id);
            const icon = CATEGORY_ICONS[c.category] ?? "📍";
            return (
              <View
                key={c.id}
                className="flex-row items-center gap-3 py-2.5 border-b border-brand-border/50"
              >
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center"
                  style={{
                    backgroundColor: done ? `${def.color}22` : "#1A1A2E",
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{done ? icon : "🔒"}</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium"
                    style={{ color: done ? "#fff" : "#8888AA" }}
                    numberOfLines={1}
                  >
                    {c.title}
                  </Text>
                </View>
                {done && (
                  <Text className="text-xs font-bold" style={{ color: def.color }}>
                    +{c.points_value}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
