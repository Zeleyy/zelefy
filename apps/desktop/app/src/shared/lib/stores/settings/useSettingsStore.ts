import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";
import { tauriStorage } from "@/shared/lib/storage";
import i18n, { type Language } from "@/shared/config/i18n";
import { invokeTry } from "./helpers";

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
    gatewayUrl: string;
    defaultGatewayUrl: string;

    _hasHydrated: boolean;

    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setColorScheme: (scheme: ColorScheme) => void;
    setLanguage: (lang: Language) => void;
    toggleSidebar: () => void;
    setIsMuted: (isMuted: boolean) => void;
    setVolume: (volume: number) => void;

    setGatewayUrl: (newUrl: string) => Promise<void>;
    resetGatewayUrl: () => Promise<void>;
    initGatewayUrl: () => Promise<void>;
    initDefaultGatewayUrl: () => Promise<void>;

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
            gatewayUrl: "",
            defaultGatewayUrl: "",

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

            setGatewayUrl: async (newUrl) => {
                try {
                    await invoke("set_gateway_url", { newUrl });
                    set({ gatewayUrl: newUrl });
                } catch (error) {
                    console.error("Failed to update gateway URL in backend:", error);
                }
            },

            resetGatewayUrl: async () => {
                try {
                    const url = await invoke<string>("reset_gateway_url");
                    set({ gatewayUrl: url });
                } catch (error) {
                    console.error("Failed to reset gateway URL from backend:", error);
                }
            },

            initGatewayUrl: async () => {
                try {
                    const url = await invoke<string>("get_gateway_url");
                    set({ gatewayUrl: url });
                } catch (error) {
                    console.error("Failed to fetch gateway URL from backend:", error);
                }
            },

            initDefaultGatewayUrl: async () => {
                const url = await invokeTry<string>(
                    "get_default_gateway_url",
                    {},
                    "Failed to fetch default gateway:",
                );
                if (url !== null) set({ defaultGatewayUrl: url });
            },

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
                gatewayUrl: state.gatewayUrl,
            }),
            storage: createJSONStorage(() => tauriStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
                void state?.initGatewayUrl();
                void state?.initDefaultGatewayUrl();
            },
        },
    ),
);
