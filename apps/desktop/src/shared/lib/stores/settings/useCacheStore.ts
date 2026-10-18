import { create } from "zustand";
import { invokeTry } from "./helpers";

interface CacheState {
    cacheRoot: string;
    defaultCacheRoot: string;
    cacheLimitMb: number;
    defaultCacheLimitMb: number;
    isRelocating: boolean;

    setCacheLimitMb: (limitMb: number) => Promise<boolean>;
    resetCacheLimit: () => Promise<void>;
    initCacheLimit: () => Promise<void>;
    initDefaultCacheLimit: () => Promise<void>;

    setCacheRoot: (path: string) => Promise<boolean>;
    resetCacheRoot: () => Promise<void>;
    initCacheRoot: () => Promise<void>;
    initDefaultCacheRoot: () => Promise<void>;
}

export const useCacheStore = create<CacheState>()((set) => ({
    cacheRoot: "",
    defaultCacheRoot: "",
    cacheLimitMb: 0,
    defaultCacheLimitMb: 0,
    isRelocating: false,

    setCacheLimitMb: async (limitMb) => {
        const limit = await invokeTry<number>(
            "set_cache_limit",
            { limitMb },
            "Failed to update cache limit:",
        );
        if (limit === null) return false;
        set({ cacheLimitMb: limit });
        return limit === limitMb;
    },

    resetCacheLimit: async () => {
        const limit = await invokeTry<number>(
            "reset_cache_limit",
            {},
            "Failed to reset cache limit:",
        );
        if (limit !== null) set({ cacheLimitMb: limit });
    },

    initCacheLimit: async () => {
        const limit = await invokeTry<number>(
            "get_cache_limit",
            {},
            "Failed to fetch cache limit:",
        );
        if (limit !== null) set({ cacheLimitMb: limit });
    },

    initDefaultCacheLimit: async () => {
        const limit = await invokeTry<number>(
            "get_default_cache_limit",
            {},
            "Failed to fetch default cache limit:",
        );
        if (limit !== null) set({ defaultCacheLimitMb: limit });
    },

    setCacheRoot: async (path) => {
        set({ isRelocating: true });
        try {
            const root = await invokeTry<string>(
                "set_cache_root",
                { path },
                "Failed to set cache root:",
            );
            if (root === null) return false;
            set({ cacheRoot: root });
            return root === path;
        } finally {
            set({ isRelocating: false });
        }
    },

    resetCacheRoot: async () => {
        set({ isRelocating: true });
        try {
            const root = await invokeTry<string>(
                "reset_cache_root",
                {},
                "Failed to reset cache root:",
            );
            if (root !== null) set({ cacheRoot: root });
        } finally {
            set({ isRelocating: false });
        }
    },

    initCacheRoot: async () => {
        const root = await invokeTry<string>("get_cache_root", {}, "Failed to fetch cache root:");
        if (root !== null) set({ cacheRoot: root });
    },

    initDefaultCacheRoot: async () => {
        const root = await invokeTry<string>(
            "get_default_cache_root",
            {},
            "Failed to fetch default cache root:",
        );
        if (root !== null) set({ defaultCacheRoot: root });
    },
}));
