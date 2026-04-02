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
import { CountrySelector } from "../../src/components/auth/CountrySelector";
import { COLORS } from "../../src/constants/theme";
import { useI18n } from "../../src/i18n";
import { translateAuthError } from "../../src/utils/errors";

interface FieldErrors {
  displayName?: string;
  username?: string;
  email?: string;
  password?: string;
  country?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterScreen() {
  const { t } = useI18n();

  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    country: null as string | null,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

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

    if (score <= 1)
      return { level: 1, label: t("auth.passwordStrength.weak"), color: "#FF4D4D" };
    if (score === 2)
      return { level: 2, label: t("auth.passwordStrength.fair"), color: "#FFB800" };
    return { level: 3, label: t("auth.passwordStrength.strong"), color: "#43E97B" };
  }

  const passwordStrength = getPasswordStrength(form.password);

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FieldErrors])
      setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!form.displayName.trim())
      next.displayName = t("auth.validation.displayNameRequired");
    if (!form.username.trim())
      next.username = t("auth.validation.usernameRequired");
    else if (form.username.length < 3)
      next.username = t("auth.validation.usernameTooShort");
    else if (/\s/.test(form.username))
      next.username = t("auth.validation.usernameNoSpaces");
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      next.username = t("auth.validation.usernameInvalid");
    if (!form.email.trim()) next.email = t("auth.validation.emailRequired");
    else if (!validateEmail(form.email))
      next.email = t("auth.validation.emailInvalid");
    if (!form.password) next.password = t("auth.validation.passwordRequired");
    else if (form.password.length < 8)
      next.password = t("auth.validation.passwordTooShort");
    if (!form.country) next.country = t("auth.validation.countryRequired");
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
    setPendingConfirmation(false);
    const { data, error } = await signUp(
      form.email.trim().toLowerCase(),
      form.password,
      form.username.trim().toLowerCase(),
      form.displayName.trim(),
      form.country ?? undefined
    );
    if (error) {
      setGlobalError(translateAuthError(error, t));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (!data) {
      // Email confirmation required
      setPendingConfirmation(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
              {t("auth.register.title")}
            </Text>
            <Text className="text-brand-muted text-sm mt-2 text-center">
              {t("auth.register.subtitle")}
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

            {pendingConfirmation && (
              <View className="bg-green-950 border border-green-500/40 rounded-2xl px-4 py-3 mb-5 flex-row items-center gap-2">
                <Text className="text-lg">📧</Text>
                <Text className="text-green-400 text-sm flex-1">
                  {t("auth.register.confirmationSent")}
                </Text>
              </View>
            )}

            <AuthInput
              label={t("auth.register.displayNameLabel")}
              value={form.displayName}
              onChangeText={(v) => update("displayName", v)}
              placeholder={t("auth.register.displayNamePlaceholder")}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => usernameRef.current?.focus()}
              error={errors.displayName}
            />

            <AuthInput
              label={t("auth.register.usernameLabel")}
              value={form.username}
              onChangeText={(v) =>
                update("username", v.toLowerCase().replace(/\s/g, ""))
              }
              placeholder={t("auth.register.usernamePlaceholder")}
              autoCapitalize="none"
              autoComplete="username"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              error={errors.username}
            />

            <AuthInput
              label={t("auth.register.emailLabel")}
              value={form.email}
              onChangeText={(v) => update("email", v)}
              placeholder={t("auth.register.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={errors.email}
            />

            <AuthInput
              label={t("auth.register.passwordLabel")}
              value={form.password}
              onChangeText={(v) => update("password", v)}
              placeholder={t("auth.register.passwordPlaceholder")}
              isPassword
              autoComplete="new-password"
              returnKeyType="next"
              onSubmitEditing={() => {}}
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
                  {passwordStrength.label}
                </Text>
              </View>
            )}

            <CountrySelector
              value={form.country}
              onChange={(code) => update("country", code)}
              label={t("auth.register.countryLabel")}
              placeholder={t("auth.register.countryPlaceholder")}
              error={errors.country}
            />

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
                    {t("auth.register.button")}
                  </Text>
                )}
              </View>
            </Pressable>

            <Text className="text-brand-muted text-xs text-center mb-5 leading-relaxed px-4">
              {t("auth.register.terms")}{" "}
              <Text className="text-brand-primary">{t("auth.register.termsLink")}</Text>{" "}
              {t("auth.register.termsAnd")}{" "}
              <Text className="text-brand-primary">{t("auth.register.privacyLink")}</Text>.
            </Text>

            {/* Divider */}
            <View className="flex-row items-center mb-5">
              <View className="flex-1 h-px bg-brand-border" />
              <Text className="text-brand-muted text-xs mx-3">{t("common.or")}</Text>
              <View className="flex-1 h-px bg-brand-border" />
            </View>

            {/* Switch */}
            <View className="flex-row justify-center pb-8">
              <Text className="text-brand-muted text-sm">
                {t("auth.register.hasAccount")}{" "}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="text-brand-primary text-sm font-bold">
                    {t("auth.register.signIn")}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
