import { create } from "zustand";
import { storage } from "../storage";

export type Theme = "dark" | "light";
export type ColorScheme = "orange" | "green" | "purple" | "blue";

interface ThemeState {
    theme: Theme;
    colorScheme: ColorScheme;
    setTheme: (theme: Theme) => void;
    setColorScheme: (scheme: ColorScheme) => void;
    toggleTheme: () => void;
}

const applyThemeAndScheme = (theme: Theme, scheme: ColorScheme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-color-scheme", scheme);
};

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: "dark",
    colorScheme: "orange",

    setTheme: (theme) => {
        applyThemeAndScheme(theme, get().colorScheme);
        set({ theme });
        storage.set("theme", theme).then(() => storage.save());
    },

    setColorScheme: (colorScheme) => {
        applyThemeAndScheme(get().theme, colorScheme);
        set({ colorScheme });
        storage.set("colorScheme", colorScheme).then(() => storage.save());
    },

    toggleTheme: () => {
        const nextTheme = get().theme === "dark" ? "light" : "dark";
        get().setTheme(nextTheme);
    },
}));
