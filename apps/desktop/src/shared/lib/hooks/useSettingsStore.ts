import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage } from "@/shared/lib/storage";

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

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            theme: "dark",
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
            name: "app-settings",
            partialize: (state) => ({
                theme: state.theme,
                colorScheme: state.colorScheme,
                language: state.language,
                isSidebarMinified: state.isSidebarMinified,
            }),
            storage: createJSONStorage(() => ({
                getItem: async (name) => {
                    const value = await storage.get<string>(name);
                    return value ?? null;
                },
                setItem: async (name, value) => {
                    await storage.set(name, value);
                },
                removeItem: async (name) => {
                    await storage.delete(name);
                },
            })),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
