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
import { signIn } from "../../src/services/auth";
import { AuthInput } from "../../src/components/auth/AuthInput";
import { COLORS } from "../../src/constants/theme";
import { useI18n } from "../../src/i18n";
import { translateAuthError } from "../../src/utils/errors";

interface FieldErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = t("auth.validation.emailRequired");
    else if (!validateEmail(email)) next.email = t("auth.validation.emailInvalid");
    if (!password) next.password = t("auth.validation.passwordRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin() {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    setGlobalError(null);
    const { error } = await signIn(email.trim().toLowerCase(), password);
    if (error) {
      setGlobalError(translateAuthError(error, t));
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
          <View className="items-center pt-16 pb-10 px-6">
            <View className="w-20 h-20 rounded-3xl bg-brand-primary/20 border border-brand-primary/40 items-center justify-center mb-5">
              <Text className="text-4xl">🌍</Text>
            </View>
            <Text className="text-white font-bold text-3xl tracking-tight">
              {t("auth.login.title")}
            </Text>
            <Text className="text-brand-muted text-sm mt-2 text-center">
              {t("auth.login.subtitle")}
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
              label={t("auth.login.emailLabel")}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              placeholder={t("auth.login.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={errors.email}
            />

            <AuthInput
              label={t("auth.login.passwordLabel")}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              placeholder={t("auth.login.passwordPlaceholder")}
              isPassword
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              error={errors.password}
            />

            <Pressable className="self-end mb-6 -mt-2">
              <Text className="text-brand-primary text-sm font-medium">
                {t("auth.login.forgotPassword")}
              </Text>
            </Pressable>

            {/* CTA */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className="rounded-2xl overflow-hidden mb-6"
              style={{ opacity: loading ? 0.8 : 1 }}
            >
              <View
                className="py-4 items-center justify-center rounded-2xl"
                style={{ backgroundColor: COLORS.primary }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base tracking-wide">
                    {t("auth.login.button")}
                  </Text>
                )}
              </View>
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-brand-border" />
              <Text className="text-brand-muted text-xs mx-3">{t("common.or")}</Text>
              <View className="flex-1 h-px bg-brand-border" />
            </View>

            {/* Switch */}
            <View className="flex-row justify-center pb-8">
              <Text className="text-brand-muted text-sm">{t("auth.login.noAccount")} </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text className="text-brand-primary text-sm font-bold">
                    {t("auth.login.createAccount")}
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
