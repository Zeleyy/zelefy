import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { tauriStorage } from "@/shared/lib/storage";
import i18n, { type Language } from "@/shared/config/i18n";

export const Theme = {
    dark: "dark",
    light: "light",
} as const;
export type Theme = (typeof Theme)[keyof typeof Theme];

export type ColorScheme = "orange" | "green" | "purple" | "blue";

interface SettingsState {
    theme?: Theme;
    colorScheme: ColorScheme;
    language?: Language;
    isSidebarMinified: boolean;
    isMuted: boolean;
    volume: number;

    _hasHydrated: boolean;

    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setColorScheme: (scheme: ColorScheme) => void;
    setLanguage: (lang: Language) => void;
    toggleSidebar: () => void;
    setIsMuted: (isMuted: boolean) => void;
    setVolume: (volume: number) => void;

    setHasHydrated: (hasHydrated: boolean) => void;
}

type PersistedSettings = Pick<
    SettingsState,
    "theme" | "colorScheme" | "language" | "isSidebarMinified"
>;

export const useSettingsStore = create<SettingsState>()(
    persist<SettingsState, [], [], PersistedSettings>(
        (set, get) => ({
            theme: undefined,
            colorScheme: "orange",
            language: undefined,
            isSidebarMinified: false,
            isMuted: false,
            volume: 50,

            _hasHydrated: false,

            toggleTheme: () => {
                const nextTheme = get().theme === Theme.dark ? Theme.light : Theme.dark;
                get().setTheme(nextTheme);
            },
            setTheme: (theme) => {
                document.documentElement.setAttribute("data-theme", theme);
                set({ theme });
            },
            setColorScheme: (colorScheme) => {
                document.documentElement.setAttribute("data-color-scheme", colorScheme);
                set({ colorScheme });
            },
            setLanguage: (language) => {
                void i18n.changeLanguage(language);
                set({ language });
            },
            toggleSidebar: () => set((state) => ({ isSidebarMinified: !state.isSidebarMinified })),

            setIsMuted: (isMuted) => set({ isMuted: isMuted }),
            setVolume: (volume) => set({ volume: volume }),

            setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
        }),
        {
            name: "settings",
            partialize: (state) => ({
                theme: state.theme,
                colorScheme: state.colorScheme,
                language: state.language,
                isSidebarMinified: state.isSidebarMinified,
                isMuted: state.isMuted,
                volume: state.volume,
            }),
            storage: createJSONStorage(() => tauriStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
