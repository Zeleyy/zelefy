import { create } from "zustand";

interface PlayerState {
    isPlaying: boolean;
    currentTime: number;

    setIsPlaying: (isPlaying: boolean) => void;
    togglePlay: () => void;
    setCurrentTime: (time: number) => void;
    resetPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
    isPlaying: false,
    currentTime: 0,

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setCurrentTime: (currentTime) => set({ currentTime }),
    resetPlayer: () => set({ isPlaying: false, currentTime: 0 }),
}));
