import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { tauriStorage } from "@/shared/lib/storage";

export type Theme = "dark" | "light";
export type ColorScheme = "orange" | "green" | "purple" | "blue";

interface SettingsState {
    theme: Theme;
    colorScheme: ColorScheme;
    language: string;
    isSidebarMinified: boolean;
    _hasHydrated: boolean;

    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setColorScheme: (scheme: ColorScheme) => void;
    setLanguage: (lang: string) => void;
    toggleSidebar: () => void;
    setHasHydrated: (state: boolean) => void;
}

type PersistedSettings = Pick<
    SettingsState,
    "theme" | "colorScheme" | "language" | "isSidebarMinified"
>;

export const useSettingsStore = create<SettingsState>()(
    persist<SettingsState, [], [], PersistedSettings>(
        (set, get) => ({
            theme: null as unknown as Theme,
            colorScheme: "orange",
            language: "ru",
            isSidebarMinified: false,
            _hasHydrated: false,

            toggleTheme: () => {
                const nextTheme = get().theme === "dark" ? "light" : "dark";
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
            setLanguage: (language) => set({ language }),
            toggleSidebar: () => set((state) => ({ isSidebarMinified: !state.isSidebarMinified })),
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: "settings",
            partialize: (state) => ({
                theme: state.theme,
                colorScheme: state.colorScheme,
                language: state.language,
                isSidebarMinified: state.isSidebarMinified,
            }),
            storage: createJSONStorage(() => tauriStorage),
            onRehydrateStorage: () => (state) => {
                if (!state) return;

                if (!state.theme) {
                    getCurrentWindow()
                        .theme()
                        .then((sysTheme) => {
                            const initialTheme: Theme = sysTheme === "dark" ? "dark" : "light";
                            state.setTheme(initialTheme);
                        })
                        .catch(() => {
                            state.setTheme("dark");
                        })
                        .finally(() => {
                            state.setHasHydrated(true);
                        });
                } else {
                    document.documentElement.setAttribute("data-theme", state.theme);
                    state.setHasHydrated(true);
                }
            },
        },
    ),
);
