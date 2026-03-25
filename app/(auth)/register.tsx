import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";
import { signUp } from "../../src/services/auth";
import { AuthInput } from "../../src/components/auth/AuthInput";
import { COLORS } from "../../src/constants/theme";

interface FieldErrors {
  displayName?: string;
  username?: string;
  email?: string;
  password?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordStrength(password: string): {
  level: 0 | 1 | 2 | 3;
  label: string;
  color: string;
} {
  if (password.length === 0) return { level: 0, label: "", color: "transparent" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: "Weak", color: "#FF4D4D" };
  if (score === 2) return { level: 2, label: "Fair", color: "#FFB800" };
  return { level: 3, label: "Strong", color: "#43E97B" };
}

export default function RegisterScreen() {
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const passwordStrength = getPasswordStrength(form.password);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!form.displayName.trim()) next.displayName = "Display name is required.";
    if (!form.username.trim()) next.username = "Username is required.";
    else if (form.username.length < 3) next.username = "At least 3 characters.";
    else if (/\s/.test(form.username)) next.username = "No spaces allowed.";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      next.username = "Only letters, numbers and underscores.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!validateEmail(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 8) next.password = "At least 8 characters required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    setGlobalError(null);
    const { error } = await signUp(
      form.email.trim().toLowerCase(),
      form.password,
      form.username.trim().toLowerCase(),
      form.displayName.trim()
    );
    if (error) {
      setGlobalError(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View className="items-center pt-12 pb-8 px-6">
            <View className="w-20 h-20 rounded-3xl bg-brand-accent/20 border border-brand-accent/40 items-center justify-center mb-5">
              <Text className="text-4xl">🗺️</Text>
            </View>
            <Text className="text-white font-bold text-3xl tracking-tight">
              Join Gamundi
            </Text>
            <Text className="text-brand-muted text-sm mt-2 text-center">
              Unlock the world, one destination at a time
            </Text>
          </View>

          {/* Form */}
          <View className="px-6 flex-1">
            {globalError && (
              <View className="bg-red-950 border border-red-500/40 rounded-2xl px-4 py-3 mb-5 flex-row items-center gap-2">
                <Text className="text-lg">⚠️</Text>
                <Text className="text-red-400 text-sm flex-1">{globalError}</Text>
              </View>
            )}

            <AuthInput
              label="Display Name"
              value={form.displayName}
              onChangeText={(v) => update("displayName", v)}
              placeholder="How you appear to others"
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => usernameRef.current?.focus()}
              error={errors.displayName}
            />

            <AuthInput
              label="Username"
              value={form.username}
              onChangeText={(v) => update("username", v.toLowerCase().replace(/\s/g, ""))}
              placeholder="your_handle"
              autoCapitalize="none"
              autoComplete="username"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              error={errors.username}
            />

            <AuthInput
              label="Email"
              value={form.email}
              onChangeText={(v) => update("email", v)}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={errors.email}
            />

            <AuthInput
              label="Password"
              value={form.password}
              onChangeText={(v) => update("password", v)}
              placeholder="Min. 8 characters"
              isPassword
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              error={errors.password}
            />

            {/* Password strength bar */}
            {form.password.length > 0 && (
              <View className="mb-5 -mt-2">
                <View className="flex-row gap-1.5 mb-1">
                  {([1, 2, 3] as const).map((level) => (
                    <View
                      key={level}
                      className="flex-1 h-1 rounded-full"
                      style={{
                        backgroundColor:
                          passwordStrength.level >= level
                            ? passwordStrength.color
                            : COLORS.border,
                      }}
                    />
                  ))}
                </View>
                <Text className="text-xs ml-1" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label} password
                </Text>
              </View>
            )}

            {/* CTA */}
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={{ opacity: loading ? 0.8 : 1 }}
              className="rounded-2xl overflow-hidden mb-5"
            >
              <View
                className="py-4 items-center justify-center rounded-2xl"
                style={{ backgroundColor: COLORS.primary }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base tracking-wide">
                    Create Account
                  </Text>
                )}
              </View>
            </Pressable>

            <Text className="text-brand-muted text-xs text-center mb-5 leading-relaxed px-4">
              By creating an account you agree to our{" "}
              <Text className="text-brand-primary">Terms of Service</Text> and{" "}
              <Text className="text-brand-primary">Privacy Policy</Text>.
            </Text>

            {/* Divider */}
            <View className="flex-row items-center mb-5">
              <View className="flex-1 h-px bg-brand-border" />
              <Text className="text-brand-muted text-xs mx-3">or</Text>
              <View className="flex-1 h-px bg-brand-border" />
            </View>

            {/* Switch */}
            <View className="flex-row justify-center pb-8">
              <Text className="text-brand-muted text-sm">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="text-brand-primary text-sm font-bold">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
