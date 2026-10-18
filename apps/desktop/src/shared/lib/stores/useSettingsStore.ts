import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { tauriStorage } from "@/shared/lib/storage";
import i18n from "@/shared/config/i18n";
import { invoke } from "@tauri-apps/api/core";

export type Theme = "dark" | "light";
export type ColorScheme = "orange" | "green" | "purple" | "blue";

interface SettingsState {
    theme?: Theme;
    colorScheme: ColorScheme;
    language?: string;
    isSidebarMinified: boolean;
    isMuted: boolean;
    volume: number;
    cacheLimitMb: number;
    gatewayUrl: string;
    defaultGatewayUrl: string;

    cacheRoot: string;
    defaultCacheRoot: string;
    isRelocating: boolean;

    _hasHydrated: boolean;

    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setColorScheme: (scheme: ColorScheme) => void;
    setLanguage: (lang: string) => void;
    toggleSidebar: () => void;
    setIsMuted: (isMuted: boolean) => void;
    setVolume: (volume: number) => void;

    setCacheLimitMb: (limitMb: number) => Promise<void>;
    initCacheLimitMb: () => Promise<void>;

    setGatewayUrl: (newUrl: string) => Promise<void>;
    resetGatewayUrl: () => Promise<void>;
    initGatewayUrl: () => Promise<void>;
    initDefaultGatewayUrl: () => Promise<void>;

    setCacheRoot: (path: string) => Promise<boolean>;
    resetCacheRoot: () => Promise<void>;
    initCacheRoot: () => Promise<void>;
    initDefaultCacheRoot: () => Promise<void>;

    setHasHydrated: (state: boolean) => void;
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
            cacheLimitMb: 1024,
            gatewayUrl: "",
            defaultGatewayUrl: "",
            cacheRoot: "",
            defaultCacheRoot: "",
            isRelocating: false,

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
            setLanguage: (language) => {
                i18n.changeLanguage(language);
                set({ language });
            },
            toggleSidebar: () => set((state) => ({ isSidebarMinified: !state.isSidebarMinified })),

            setIsMuted: (isMuted) => set({ isMuted: isMuted }),
            setVolume: (volume) => set({ volume: volume }),

            setCacheLimitMb: async (limitMb) => {
                try {
                    await invoke("set_cache_limit", { limitMb });
                    set({ cacheLimitMb: limitMb });
                } catch (error) {
                    console.error("Failed to update cache limit in backend:", error);
                }
            },

            initCacheLimitMb: async () => {
                try {
                    const limit = await invoke<number>("get_cache_limit");
                    set({ cacheLimitMb: limit });
                } catch (error) {
                    console.error("Failed to fetch cache limit from backend:", error);
                }
            },

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
                try {
                    const url = await invoke<string>("get_default_gateway_url");
                    set({ defaultGatewayUrl: url });
                } catch (error) {
                    console.error("Failed to fetch default gateway URL from backend:", error);
                }
            },

            setCacheRoot: async (path) => {
                set({ isRelocating: true });
                try {
                    await invoke("set_cache_root", { path });
                    const root = await invoke<string>("get_cache_root");
                    set({ cacheRoot: root });
                    return true;
                } catch (error) {
                    console.error("Failed to set cache root:", error);
                    return false;
                } finally {
                    set({ isRelocating: false });
                }
            },

            resetCacheRoot: async () => {
                set({ isRelocating: true });
                try {
                    await invoke("reset_cache_root");
                    const root = await invoke<string>("get_cache_root");
                    set({ cacheRoot: root });
                } catch (error) {
                    console.error("Failed to reset cache root:", error);
                } finally {
                    set({ isRelocating: false });
                }
            },

            initCacheRoot: async () => {
                try {
                    const root = await invoke<string>("get_cache_root");
                    set({ cacheRoot: root });
                } catch (error) {
                    console.error("Failed to fetch cache root:", error);
                }
            },

            initDefaultCacheRoot: async () => {
                try {
                    const root = await invoke<string>("get_default_cache_root");
                    set({ defaultCacheRoot: root });
                } catch (error) {
                    console.error("Failed to fetch default cache root:", error);
                }
            },

            setHasHydrated: (state) => set({ _hasHydrated: state }),
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
                cacheLimitMb: state.cacheLimitMb,
                gatewayUrl: state.gatewayUrl,
            }),
            storage: createJSONStorage(() => tauriStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
                state?.initGatewayUrl();
                state?.initDefaultGatewayUrl();
                state?.initCacheLimitMb();
                state?.initCacheRoot();
                state?.initDefaultCacheRoot();
            },
        },
    ),
);
