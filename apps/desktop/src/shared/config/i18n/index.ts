import i18n from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { locale } from "@tauri-apps/plugin-os";

export const initI18n = async () => {
    const systemLocale = await locale();
    const currentLanguage = systemLocale ? systemLocale.split("-")[0] : "en";

    await i18n
        .use(
            resourcesToBackend(
                (language: string) => import(`./locales/${language}/translation.json`),
            ),
        )
        .use(initReactI18next)
        .init({
            lng: currentLanguage,
            fallbackLng: "en",
            interpolation: {
                escapeValue: false,
            },
        });
};

export default i18n;
