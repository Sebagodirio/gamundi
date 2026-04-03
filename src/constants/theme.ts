export const COLORS = {
  primary: "#6C63FF",
  secondary: "#FF6584",
  accent: "#43E97B",
  dark: "#0D0D1A",
  surface: "#1A1A2E",
  card: "#16213E",
  border: "#2A2A4A",
  muted: "#8888AA",
  white: "#FFFFFF",
  danger: "#FF4D4D",
  warning: "#FFB800",
  success: "#43E97B",
} as const;

export const RANK_COLORS: Record<string, string> = {
  BRONZE: "#CD7F32",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PLATINUM: "#E5E4E2",
  DIAMOND: "#B9F2FF",
};

export const CATEGORY_ICONS: Record<string, string> = {
  COUNTRY: "🌍",
  WONDER: "🏛️",
  HIDDEN_GEM: "💎",
  MAGIC_TOWN: "✨",
  CONTINENT: "🗺️",
};
