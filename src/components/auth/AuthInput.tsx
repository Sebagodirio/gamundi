import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { COLORS } from "../../constants/theme";

interface AuthInputProps extends Omit<TextInputProps, "style"> {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function AuthInput({ label, error, isPassword = false, ...props }: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const borderColor = error
    ? "#FF4D4D"
    : focused
    ? COLORS.primary
    : COLORS.border;

  return (
    <View className="mb-4">
      <Text className="text-brand-muted text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1">
        {label}
      </Text>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <View
          className="flex-row items-center rounded-2xl px-4 bg-brand-surface"
          style={{
            borderWidth: 1.5,
            borderColor,
            minHeight: 52,
          }}
        >
          <TextInput
            ref={inputRef}
            {...props}
            secureTextEntry={isPassword && !passwordVisible}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            placeholderTextColor={COLORS.muted}
            className="flex-1 text-white text-base py-3"
            style={{ color: COLORS.white }}
          />
          {isPassword && (
            <Pressable
              onPress={() => setPasswordVisible((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="ml-2"
            >
              <Text className="text-brand-muted text-lg">
                {passwordVisible ? "🙈" : "👁️"}
              </Text>
            </Pressable>
          )}
        </View>
      </Pressable>
      {error ? (
        <Text className="text-red-400 text-xs mt-1.5 ml-1">{error}</Text>
      ) : null}
    </View>
  );
}
