import { create } from "zustand";
import type { PublicTrack } from "@zelefy/types";

export type RepeatMode = "off" | "queue" | "track";

interface PlayerState {
    currentTrack: PublicTrack | null;
    isPlaying: boolean;
    currentTime: number;

    queue: PublicTrack[];
    currentIndex: number;

    isShuffle: boolean;
    repeatMode: RepeatMode;

    setIsPlaying: (isPlaying: boolean) => void;
    togglePlay: () => void;
    seek: (time: number) => void;

    playTrack: (track: PublicTrack, queue?: PublicTrack[]) => void;

    nextTrack: () => void;
    previousTrack: () => void;

    setQueue: (queue: PublicTrack[]) => void;
    addToQueue: (track: PublicTrack) => void;

    toggleShuffle: () => void;
    toggleRepeat: () => void;

    resetPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    currentTrack: {
        trackId: "",
        userId: "",
        permalink: "string",

        title: "A-One - U.N. Owen Was Her? feat. HIKO",
        audioUrl: "",
        durationSeconds: 204,
        coverUrl: null,
        waveformUrl: "",

        genre: null,
        description: null,
        bpm: null,
        keySignature: null,
        createdAt: "",

        playsCount: 0,
        likesCount: 0,
        repostsCount: 0,
        commentsCount: 0,
    },
    isPlaying: false,
    currentTime: 105,

    queue: [],
    currentIndex: 0,

    isShuffle: false,
    repeatMode: "off",

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    seek: (time) => set({ currentTime: time }),

    playTrack: (track, newQueue) => {
        const queue = newQueue ?? get().queue;
        let index = queue.findIndex((t) => t.trackId === track.trackId);

        if (index === -1) {
            queue.push(track);
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

    nextTrack: () => {
        const { queue, currentIndex, repeatMode } = get();
        if (queue.length === 0) return;

        if (repeatMode === "track") {
            set({ currentTime: 0, isPlaying: true });
            return;
        }

        const nextIndex = currentIndex + 1;

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

    previousTrack: () => {
        const { queue, currentIndex, currentTime } = get();
        if (queue.length === 0) return;

        if (currentTime > 3) {
            set({ currentTime: 0 });
            return;
        }

        const prevIndex = Math.max(currentIndex - 1, 0);
        set({
            currentIndex: prevIndex,
            currentTrack: queue[prevIndex],
            currentTime: 0,
            isPlaying: true,
        });
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
            currentIndex: -1,
        }),
}));
