import i18n from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { storage } from "@/shared/lib/storage";

i18n.use(Backend)
    .use(resourcesToBackend((language: string) => import(`./locales/${language}/translation.json`)))
    .use(I18nextBrowserLanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });

i18n.on("languageChanged", async (lang) => {
    await storage.set("language", lang);
});

export default i18n;
