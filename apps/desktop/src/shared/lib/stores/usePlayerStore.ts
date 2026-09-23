import { create } from "zustand";

interface PlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;

    setIsPlaying: (isPlaying: boolean) => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setDuration: (duration: number) => void;
    resetPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
    isPlaying: false,
    currentTime: 105,
    duration: 204,

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    seek: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),
    resetPlayer: () => set({ isPlaying: false, currentTime: 0, duration: 0 }),
}));
