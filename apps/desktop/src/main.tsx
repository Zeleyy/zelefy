import "./app/styles/index.scss";
import { createRoot } from "react-dom/client";
import { useSettingsStore } from "./shared/lib/hooks/useSettingsStore";
import { QueryProvider } from "./app/providers";
import i18n, { initI18n } from "./shared/config/i18n";
import App from "./app/App";

const root = createRoot(document.getElementById("root") as HTMLElement);

const init = async () => {
    try {
        const i18nPromise = initI18n();

        const hydrationPromise = new Promise<void>((resolve) => {
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

        await Promise.all([i18nPromise, hydrationPromise]);

        const { theme, colorScheme, language } = useSettingsStore.getState();

        if (language) {
            await i18n.changeLanguage(language);
        }

        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.setAttribute("data-color-scheme", colorScheme);

        root.render(
            <QueryProvider>
                <App />
            </QueryProvider>,
        );
    } catch (error) {
        console.error("Failed to initialize app:", error);
    }
};

init();
