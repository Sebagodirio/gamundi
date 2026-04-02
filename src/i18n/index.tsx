import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import en, { type Translations } from "./locales/en";
import es from "./locales/es";

export type Locale = "en" | "es";

type NestedKeyOf<T, K extends string = ""> = T extends object
  ? {
      [P in keyof T]: P extends string
        ? K extends ""
          ? NestedKeyOf<T[P], P>
          : NestedKeyOf<T[P], `${K}.${P}`>
        : never;
    }[keyof T]
  : K;

export type TranslationKey = NestedKeyOf<Translations>;

const STORAGE_KEY = "@gamundi/locale";

const translations: Record<Locale, Translations> = { en, es };

function get(obj: unknown, path: string): string {
  const value = path
    .split(".")
    .reduce((acc: unknown, key) => (acc as Record<string, unknown>)?.[key], obj);
  return typeof value === "string" ? value : path;
}

function resolveLocale(tag: string): Locale {
  if (tag.startsWith("es")) return "es";
  return "en";
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const deviceLocale = resolveLocale(
    Localization.getLocales()[0]?.languageTag ?? "en"
  );
  const [locale, setLocaleState] = useState<Locale>(deviceLocale);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "en" || saved === "es") setLocaleState(saved);
    });
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  function t(key: TranslationKey): string {
    return get(translations[locale], key);
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
