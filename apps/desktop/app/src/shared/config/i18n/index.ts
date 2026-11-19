import i18n from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

export const Language = {
    en: "en",
    ru: "ru",
} as const;
export type Language = (typeof Language)[keyof typeof Language];
export const SUPPORTED_LANGUAGES = Object.values(Language);

export const isLanguage = (value: string): value is Language =>
    (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

export const LANGUAGE_LABELS: Record<Language, string> = {
    en: "English",
    ru: "Русский",
};

export const DEFAULT_LANGUAGE: Language = Language.en;
export const FALLBACK_LANGUAGE: Language = Language.en;

export const initI18n = async () => {
    await i18n
        .use(
            resourcesToBackend(
                (language: string) => import(`./locales/${language}/translation.json`),
            ),
        )
        .use(initReactI18next)
        .init({
            lng: DEFAULT_LANGUAGE,
            fallbackLng: FALLBACK_LANGUAGE,
            interpolation: {
                escapeValue: false,
            },
        });
};

export default i18n;
