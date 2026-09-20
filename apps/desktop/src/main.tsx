import "./app/styles/index.scss";
import { createRoot } from "react-dom/client";
import { useSettingsStore } from "./shared/lib/hooks/useSettingsStore";
import { QueryProvider } from "./app/providers";
import App from "./app/App";
import i18n from "./shared/config/i18n";

const root = createRoot(document.getElementById("root") as HTMLElement);

const init = async () => {
    try {
        await new Promise<void>((resolve) => {
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

        const { theme, colorScheme, language } = useSettingsStore.getState();

        await i18n.changeLanguage(language);
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
