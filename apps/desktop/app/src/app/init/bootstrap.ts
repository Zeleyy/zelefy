import { getCurrentWindow } from "@tauri-apps/api/window";
import { locale } from "@tauri-apps/plugin-os";
import { i18n, initI18n, isLanguage, Language } from "@/shared/config";
import { Theme, useCacheStore, useSettingsStore } from "@/shared/lib/stores";

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
        return sysTheme === Theme.dark ? Theme.dark : Theme.light;
    } catch {
        return Theme.dark;
    }
};

const resolveLanguage = async (): Promise<Language> => {
    try {
        const systemLocale = await locale();
        const code = systemLocale?.split("-")[0];
        return code && isLanguage(code) ? code : Language.en;
    } catch {
        return Language.en;
    }
};

export const bootstrapApp = async (): Promise<void> => {
    await Promise.all([initI18n(), waitForHydration()]);

    const cache = useCacheStore.getState();
    await Promise.all([
        cache.initCacheRoot(),
        cache.initCacheLimit(),
        cache.initDefaultCacheRoot(),
        cache.initDefaultCacheLimit(),
    ]);

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
