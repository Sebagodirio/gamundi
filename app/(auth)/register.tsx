import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";
import { signUp } from "../../src/services/auth";
import { Button } from "../../src/components/ui/Button";
import { COLORS } from "../../src/constants/theme";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    displayName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    const { email, password, username, displayName } = form;
    if (!email || !password || !username || !displayName) {
      setError("Please fill in all fields.");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await signUp(email, password, username, displayName);
    if (authError) setError(authError);
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-1 justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8 items-center">
            <Text className="text-white font-bold text-2xl">Create Account</Text>
            <Text className="text-brand-muted text-sm mt-1">Start your adventure 🗺️</Text>
          </View>

          {error && (
            <View className="bg-red-900/30 border border-red-500/50 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-400 text-sm">{error}</Text>
            </View>
          )}

          <View className="gap-3 mb-6">
            {(
              [
                { key: "displayName", placeholder: "Display Name", autoCapitalize: "words" },
                { key: "username", placeholder: "Username (no spaces)", autoCapitalize: "none" },
                { key: "email", placeholder: "Email", keyboardType: "email-address", autoCapitalize: "none" },
                { key: "password", placeholder: "Password", secureTextEntry: true },
              ] as Array<{
                key: keyof typeof form;
                placeholder: string;
                autoCapitalize?: "none" | "words" | "sentences" | "characters";
                keyboardType?: "email-address" | "default";
                secureTextEntry?: boolean;
              }>
            ).map(({ key, placeholder, autoCapitalize = "sentences", keyboardType, secureTextEntry }) => (
              <TextInput
                key={key}
                value={form[key]}
                onChangeText={(val) => updateField(key, val)}
                placeholder={placeholder}
                placeholderTextColor={COLORS.muted}
                autoCapitalize={autoCapitalize}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                className="bg-brand-surface border border-brand-border rounded-xl px-4 py-3.5"
                style={{ color: COLORS.white }}
              />
            ))}
          </View>

          <Button label="Create Account" onPress={handleRegister} loading={loading} size="lg" />

          <View className="flex-row justify-center mt-6">
            <Text className="text-brand-muted text-sm">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-brand-primary text-sm font-semibold">Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
