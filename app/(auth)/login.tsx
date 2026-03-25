import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";
import { signIn } from "../../src/services/auth";
import { Button } from "../../src/components/ui/Button";
import { COLORS } from "../../src/constants/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await signIn(email, password);
    if (authError) setError(authError);
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <View className="mb-10 items-center">
          <Text className="text-7xl mb-4">🌍</Text>
          <Text className="text-white font-bold text-3xl">Gamundi</Text>
          <Text className="text-brand-muted text-sm mt-1">Travel. Unlock. Conquer.</Text>
        </View>

        {error && (
          <View className="bg-red-900/30 border border-red-500/50 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm">{error}</Text>
          </View>
        )}

        <View className="gap-3 mb-6">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={COLORS.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-brand-surface border border-brand-border rounded-xl px-4 py-3.5 text-white"
            style={{ color: COLORS.white }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={COLORS.muted}
            secureTextEntry
            className="bg-brand-surface border border-brand-border rounded-xl px-4 py-3.5 text-white"
            style={{ color: COLORS.white }}
          />
        </View>

        <Button label="Sign In" onPress={handleLogin} loading={loading} size="lg" />

        <View className="flex-row justify-center mt-6">
          <Text className="text-brand-muted text-sm">Don&apos;t have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="text-brand-primary text-sm font-semibold">Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
