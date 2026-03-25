import { View } from "react-native";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <View className={`bg-brand-card rounded-2xl p-4 border border-brand-border ${className}`}>
      {children}
    </View>
  );
}
