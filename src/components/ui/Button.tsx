import { ActivityIndicator, Pressable, Text } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
}: ButtonProps) {
  const baseStyle =
    "items-center justify-center rounded-xl active:opacity-80";

  const variantStyle = {
    primary: "bg-brand-primary",
    secondary: "bg-brand-secondary",
    ghost: "bg-transparent border border-brand-border",
  }[variant];

  const sizeStyle = {
    sm: "px-3 py-2",
    md: "px-5 py-3",
    lg: "px-7 py-4",
  }[size];

  const textSizeStyle = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${
        disabled || loading ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={`font-semibold text-white ${textSizeStyle}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
