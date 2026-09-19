import "./app/styles/index.scss";
import { createRoot } from "react-dom/client";
import { storage } from "./shared/lib/storage";
import { useThemeStore, type ColorScheme, type Theme } from "./shared/lib/hooks/useThemeStore";
import { QueryProvider } from "./app/providers";
import App from "./app/App";

const root = createRoot(document.getElementById("root") as HTMLElement);

const init = async () => {
    try {
        const [savedTheme, savedScheme] = await Promise.all([
            storage.get<Theme>("theme").then((res) => res || "dark"),
            storage.get<ColorScheme>("colorScheme").then((res) => res || "orange"),
        ]);

        const themeStore = useThemeStore.getState();
        themeStore.setTheme(savedTheme);
        themeStore.setColorScheme(savedScheme);

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
