import { create } from "zustand";

interface SearchState {
    q: string;
    setQ: (q: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
    q: "",
    setQ: (q) => set({ q }),
}));
