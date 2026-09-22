import { getCurrentWindow } from "@tauri-apps/api/window";
import { locale } from "@tauri-apps/plugin-os";
import i18n, { initI18n } from "@/shared/config/i18n";
import { useSettingsStore, type Theme } from "@/shared/lib/hooks";

const waitForHydration = () =>
    new Promise<void>((resolve) => {
        if (useSettingsStore.getState()._hasHydrated) {
            resolve();
            return;
        }
        const unsub = useSettingsStore.subscribe((state) => {
            if (state._hasHydrated) {
                unsub();
                resolve();
            }
        });
    });

const resolveTheme = async (): Promise<Theme> => {
    try {
        const sysTheme = await getCurrentWindow().theme();
        return sysTheme === "dark" ? "dark" : "light";
    } catch {
        return "dark";
    }
};

const resolveLanguage = async (): Promise<string> => {
    try {
        const systemLocale = await locale();
        return systemLocale ? systemLocale.split("-")[0] : "en";
    } catch {
        return "en";
    }
};

export const bootstrapApp = async (): Promise<void> => {
    await Promise.all([initI18n(), waitForHydration()]);

    const store = useSettingsStore.getState();

    let language = store.language;
    if (!language) {
        language = await resolveLanguage();
        store.setLanguage(language);
    } else {
        await i18n.changeLanguage(language);
    }

    let theme = store.theme;
    if (!theme) {
        theme = await resolveTheme();
        store.setTheme(theme);
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }

    if (store.colorScheme) {
        document.documentElement.setAttribute("data-color-scheme", store.colorScheme);
    }
};
