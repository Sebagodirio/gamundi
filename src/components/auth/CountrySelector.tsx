import { useState, useMemo } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COUNTRIES, getFlagEmoji, type Country } from "../../constants/countries";
import { useI18n } from "../../i18n";
import { COLORS } from "../../constants/theme";

interface CountrySelectorProps {
  value: string | null;
  onChange: (code: string) => void;
  label: string;
  placeholder: string;
  error?: string;
}

export function CountrySelector({
  value,
  onChange,
  label,
  placeholder,
  error,
}: CountrySelectorProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.code === value) ?? null,
    [value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => {
      const name = locale === "es" ? c.nameEs : c.nameEn;
      return name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    });
  }, [query, locale]);

  function handleSelect(country: Country) {
    onChange(country.code);
    setOpen(false);
    setQuery("");
  }

  const displayName = selected
    ? locale === "es"
      ? selected.nameEs
      : selected.nameEn
    : null;

  return (
    <View className="mb-5">
      <Text className="text-brand-muted text-xs font-medium mb-1.5 ml-1">
        {label}
      </Text>

      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center rounded-2xl border px-4 h-14"
        style={{
          backgroundColor: COLORS.surface,
          borderColor: error ? "#f87171" : COLORS.border,
        }}
      >
        {selected ? (
          <>
            <Text className="text-2xl mr-3">{getFlagEmoji(selected.code)}</Text>
            <Text className="text-white text-sm flex-1">{displayName}</Text>
          </>
        ) : (
          <Text className="text-brand-muted text-sm flex-1">{placeholder}</Text>
        )}
        <Text className="text-brand-muted text-xs">▼</Text>
      </Pressable>

      {error && (
        <Text className="text-red-400 text-xs mt-1 ml-1">{error}</Text>
      )}

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-brand-dark">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-brand-border">
            <Text className="text-white font-bold text-lg">
              {t("country.modalTitle")}
            </Text>
            <Pressable onPress={() => { setOpen(false); setQuery(""); }}>
              <Text className="text-brand-primary font-medium text-base">✕</Text>
            </Pressable>
          </View>

          {/* Search */}
          <View className="px-5 py-3">
            <View
              className="flex-row items-center rounded-2xl px-4 h-12 border"
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
            >
              <Text className="text-brand-muted mr-2">🔍</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t("country.searchPlaceholder")}
                placeholderTextColor={COLORS.muted}
                className="flex-1 text-white text-sm"
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")}>
                  <Text className="text-brand-muted text-base ml-2">✕</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text className="text-brand-muted text-sm">
                  {t("country.noResults")}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const name = locale === "es" ? item.nameEs : item.nameEn;
              const isSelected = item.code === value;
              return (
                <Pressable
                  onPress={() => handleSelect(item)}
                  className="flex-row items-center py-3.5 border-b"
                  style={{ borderColor: COLORS.border }}
                >
                  <Text className="text-2xl mr-3">{getFlagEmoji(item.code)}</Text>
                  <Text
                    className="flex-1 text-sm"
                    style={{ color: isSelected ? COLORS.primary : "#fff" }}
                  >
                    {name}
                  </Text>
                  {isSelected && (
                    <Text style={{ color: COLORS.primary }}>✓</Text>
                  )}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
