import i18n from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

export const initI18n = async () => {
    await i18n
        .use(
            resourcesToBackend(
                (language: string) => import(`./locales/${language}/translation.json`),
            ),
        )
        .use(initReactI18next)
        .init({
            lng: "en",
            fallbackLng: "en",
            interpolation: {
                escapeValue: false,
            },
        });
};

export default i18n;
