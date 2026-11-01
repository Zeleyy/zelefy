import { create } from "zustand";
import type { PlayerTrack } from "@zelefy/types";
import { invoke } from "@tauri-apps/api/core";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { tauriStorage } from "../storage";

export type RepeatMode = "off" | "queue" | "track";

interface PlayerState {
    currentTrack: PlayerTrack | null;
    isPlaying: boolean;
    currentTime: number;

    queue: PlayerTrack[];
    currentIndex: number;

    isShuffle: boolean;
    repeatMode: RepeatMode;

    _hasHydrated: boolean;

    setIsPlaying: (isPlaying: boolean) => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setCurrentTime: (time: number) => void;

    playTrack: (track: PlayerTrack, queue?: PlayerTrack[]) => void;

    previousTrack: () => void;
    nextTrack: () => void;

    setQueue: (queue: PlayerTrack[]) => void;
    addToQueue: (track: PlayerTrack) => void;

    toggleShuffle: () => void;
    toggleRepeat: () => void;

    resetPlayer: () => void;

    setHasHydrated: (hasHydrated: boolean) => void;
}

type PersistedPlayer = Pick<
    PlayerState,
    "currentTrack" | "queue" | "currentIndex" | "isShuffle" | "repeatMode"
>;

export const usePlayerStore = create<PlayerState>()(
    subscribeWithSelector(
        persist<PlayerState, [], [], PersistedPlayer>(
            (set, get) => ({
                currentTrack: null,
                isPlaying: false,
                currentTime: 0,

                queue: [],
                currentIndex: 0,

                isShuffle: false,
                repeatMode: "off",

                _hasHydrated: false,

                setIsPlaying: (isPlaying) => set({ isPlaying }),
                togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
                seek: (time) => {
                    if (!get().currentTrack) return;
                    set({ currentTime: time });
                    void invoke("player_seek", { seconds: time });
                },
                setCurrentTime: (time) => set({ currentTime: time }),

                playTrack: (track, newQueue) => {
                    const state = get();
                    if (track.trackId === state.currentTrack?.trackId) return;

                    const baseQueue = newQueue ?? state.queue;
                    let queue = baseQueue;
                    let index = baseQueue.findIndex((t) => t.trackId === track.trackId);

                    if (index === -1) {
                        queue = [...baseQueue, track];
                        index = queue.length - 1;
                    }

                    set({
                        currentTrack: track,
                        queue,
                        currentIndex: index,
                        isPlaying: true,
                        currentTime: 0,
                    });
                },

                previousTrack: () => {
                    const { queue, currentIndex } = get();
                    if (queue.length === 0) return;

                    if (currentIndex > 0) {
                        const prevIndex = currentIndex - 1;
                        set({
                            currentIndex: prevIndex,
                            currentTrack: queue[prevIndex],
                            currentTime: 0,
                            isPlaying: true,
                        });
                    }
                },

                nextTrack: () => {
                    const { queue, currentIndex, repeatMode, isShuffle } = get();
                    if (queue.length === 0) return;

                    if (repeatMode === "track") {
                        get().seek(0);
                        set({ isPlaying: true });
                        return;
                    }

                    let nextIndex: number;
                    if (isShuffle && queue.length > 1) {
                        do {
                            nextIndex = Math.floor(Math.random() * queue.length);
                        } while (nextIndex === currentIndex);
                    } else {
                        nextIndex = currentIndex + 1;
                    }

                    if (nextIndex < queue.length) {
                        set({
                            currentIndex: nextIndex,
                            currentTrack: queue[nextIndex],
                            currentTime: 0,
                            isPlaying: true,
                        });
                    } else if (repeatMode === "queue") {
                        set({
                            currentIndex: 0,
                            currentTrack: queue[0],
                            currentTime: 0,
                            isPlaying: true,
                        });
                    } else {
                        set({ isPlaying: false });
                    }
                },

                setQueue: (queue) => set({ queue }),

                addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),

                toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

                toggleRepeat: () => {
                    const modes: RepeatMode[] = ["off", "queue", "track"];
                    const nextMode = modes[(modes.indexOf(get().repeatMode) + 1) % modes.length];
                    set({ repeatMode: nextMode });
                },

                resetPlayer: () =>
                    set({
                        currentTrack: null,
                        isPlaying: false,
                        currentTime: 0,
                        queue: [],
                        currentIndex: 0,
                    }),

                setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
            }),
            {
                name: "player",
                partialize: (s) => ({
                    currentTrack: s.currentTrack,
                    queue: s.queue,
                    currentIndex: s.currentIndex,
                    isShuffle: s.isShuffle,
                    repeatMode: s.repeatMode,
                }),
                storage: createJSONStorage(() => tauriStorage),
                onRehydrateStorage: () => (state) => {
                    state?.setIsPlaying(false);
                    state?.setHasHydrated(true);
                },
            },
        ),
    ),
);
