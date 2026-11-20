import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { tauriStorage } from "../storage";

export const MIN_QUERY_LENGTH = 3;
export const MAX_SEARCH_HISTORY = 20;

interface SearchHistoryState {
    queries: string[];
    addQuery: (query: string) => void;
    removeQuery: (query: string) => void;
    clearHistory: () => void;
}

type PersistedSearchHistory = Pick<SearchHistoryState, "queries">;

export const useSearchHistoryStore = create<SearchHistoryState>()(
    persist<SearchHistoryState, [], [], PersistedSearchHistory>(
        (set) => ({
            queries: [],
            addQuery: (query) => {
                const q = query.trim();
                if (!q) return;
                set((s) => ({
                    queries: [q, ...s.queries.filter((item) => item !== q)].slice(
                        0,
                        MAX_SEARCH_HISTORY,
                    ),
                }));
            },
            removeQuery: (query) =>
                set((s) => ({ queries: s.queries.filter((item) => item !== query.trim()) })),
            clearHistory: () => set({ queries: [] }),
        }),
        {
            name: "search-history",
            partialize: (state) => ({
                queries: state.queries,
            }),
            storage: createJSONStorage(() => tauriStorage),
        },
    ),
);
