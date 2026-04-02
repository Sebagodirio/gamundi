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
import { COUNTRIES, type CountryEntry } from "../../constants/countries";
import type { Coordinates, LocationData } from "../../types";

interface CheckInResult {
  coordinates: Coordinates;
  locationData: LocationData;
}

interface CheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (result: CheckInResult) => void;
}

export function CheckInModal({ visible, onClose, onConfirm }: CheckInModalProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query]);

  function handleSelect(country: CountryEntry) {
    const coordinates: Coordinates = {
      latitude: country.latitude,
      longitude: country.longitude,
    };
    const locationData: LocationData = {
      latitude: country.latitude,
      longitude: country.longitude,
      country_code: country.code,
      country_name: country.name,
    };
    setQuery("");
    onConfirm({ coordinates, locationData });
  }

  function handleClose() {
    setQuery("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-brand-dark">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4 border-b border-brand-border">
          <Text className="text-white font-bold text-xl">Log a Trip</Text>
          <Pressable onPress={handleClose} className="px-3 py-1">
            <Text className="text-brand-muted text-base">Cancel</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View className="px-5 pt-4 pb-3">
          <View className="flex-row items-center bg-brand-surface border border-brand-border rounded-xl px-4 py-3">
            <Text className="text-brand-muted mr-2">🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search country..."
              placeholderTextColor="#64748b"
              className="flex-1 text-white text-base"
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <Text className="text-brand-muted text-base ml-2">✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Country list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-5 pb-8"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              className="flex-row items-center py-4 border-b border-brand-border active:opacity-70"
            >
              <View className="w-10 h-10 rounded-full bg-brand-surface items-center justify-center mr-4">
                <Text className="text-base font-bold text-brand-muted">{item.code}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">{item.name}</Text>
                <Text className="text-brand-muted text-xs mt-0.5">
                  {continentLabel(item.continent)}
                </Text>
              </View>
              <Text className="text-brand-muted text-base">›</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text className="text-brand-muted text-center mt-12">No countries found.</Text>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

function continentLabel(code: string): string {
  const map: Record<string, string> = {
    AF: "Africa",
    AS: "Asia",
    EU: "Europe",
    NA: "North America",
    OC: "Oceania",
    SA: "South America",
    AN: "Antarctica",
  };
  return map[code] ?? code;
}
