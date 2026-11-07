import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";
import type { PlayerTrack } from "@zelefy/types";
import { tauriStorage } from "../storage";

export type RepeatMode = "off" | "queue" | "track";

interface QueueItem {
    qid: number;
    track: PlayerTrack;
}

interface PlayerState {
    currentTrack: PlayerTrack | null;
    isPlaying: boolean;
    currentTime: number;

    queue: QueueItem[];
    currentIndex: number;

    isShuffle: boolean;
    repeatMode: RepeatMode;

    _hasHydrated: boolean;
    _nextQid: number;

    setIsPlaying: (isPlaying: boolean) => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setCurrentTime: (time: number) => void;

    playTrack: (track: PlayerTrack, queue?: PlayerTrack[]) => void;

    previousTrack: () => void;
    nextTrack: () => void;

    patchTrack: (trackId: number, patch: Partial<PlayerTrack>) => void;
    deleteTrack: (trackId: number) => void;

    setQueue: (queue: PlayerTrack[]) => void;
    addToQueue: (track: PlayerTrack) => void;
    playFromQueue: (qid: number) => void;
    removeFromQueue: (qid: number) => void;
    clearQueue: () => void;

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
                _nextQid: 0,

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

                    if (newQueue) {
                        let nextQid = state._nextQid;
                        const items: QueueItem[] = newQueue.map((t) => ({
                            qid: nextQid++,
                            track: t,
                        }));
                        const index = items.findIndex((i) => i.track.trackId === track.trackId);

                        set({
                            currentTrack: track,
                            queue: items,
                            currentIndex: index >= 0 ? index : 0,
                            isPlaying: true,
                            currentTime: 0,
                            _nextQid: nextQid,
                        });
                        return;
                    }

                    const item: QueueItem = { qid: state._nextQid, track };
                    set({
                        currentTrack: track,
                        queue: [item],
                        currentIndex: 0,
                        isPlaying: true,
                        currentTime: 0,
                        _nextQid: state._nextQid + 1,
                    });
                },

                previousTrack: () => {
                    const { queue, currentIndex } = get();
                    if (queue.length === 0) return;

                    if (currentIndex > 0) {
                        const prevIndex = currentIndex - 1;
                        set({
                            currentIndex: prevIndex,
                            currentTrack: queue[prevIndex].track,
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
                            currentTrack: queue[nextIndex].track,
                            currentTime: 0,
                            isPlaying: true,
                        });
                    } else if (repeatMode === "queue") {
                        set({
                            currentIndex: 0,
                            currentTrack: queue[0].track,
                            currentTime: 0,
                            isPlaying: true,
                        });
                    } else {
                        set({ isPlaying: false });
                    }
                },

                patchTrack: (trackId, patch) =>
                    set((state) => ({
                        currentTrack:
                            state.currentTrack?.trackId == trackId
                                ? { ...state.currentTrack, ...patch }
                                : state.currentTrack,
                        queue: state.queue.map((item) =>
                            item.track.trackId == trackId
                                ? { ...item, track: { ...item.track, ...patch } }
                                : item,
                        ),
                    })),

                deleteTrack: (trackId) =>
                    set((state) => {
                        const isRemoved = (t: QueueItem) =>
                            String(t.track.trackId) === String(trackId);
                        const isCurrent =
                            state.currentTrack != null &&
                            String(state.currentTrack.trackId) === String(trackId);

                        if (!isCurrent && !state.queue.some(isRemoved)) return state;

                        const queue = state.queue.filter((t) => !isRemoved(t));
                        const removedBefore = state.queue
                            .slice(0, state.currentIndex)
                            .filter(isRemoved).length;
                        const shiftedIndex = state.currentIndex - removedBefore;

                        if (!isCurrent) {
                            return { queue, currentIndex: Math.max(0, shiftedIndex) };
                        }

                        if (queue.length === 0) {
                            return {
                                queue: [],
                                currentIndex: 0,
                                currentTrack: null,
                                isPlaying: false,
                                currentTime: 0,
                            };
                        }

                        const nextIndex = Math.min(shiftedIndex, queue.length - 1);
                        return {
                            queue,
                            currentIndex: nextIndex,
                            currentTrack: queue[nextIndex].track,
                            currentTime: 0,
                        };
                    }),

                setQueue: (queue) =>
                    set((state) => {
                        let nextQid = state._nextQid;
                        const items: QueueItem[] = queue.map((t) => ({ qid: nextQid++, track: t }));
                        return { queue: items, currentIndex: 0, _nextQid: nextQid };
                    }),

                addToQueue: (track) =>
                    set((state) => {
                        const last = state.queue[state.queue.length - 1];
                        if (last && last.track.trackId === track.trackId) return state;

                        const item: QueueItem = { qid: state._nextQid, track };
                        const nextQid = state._nextQid + 1;

                        if (state.queue.length >= 100) {
                            const newIndex = state.currentIndex > 0 ? state.currentIndex - 1 : 0;
                            return {
                                queue: [...state.queue.slice(1), item],
                                currentIndex: newIndex,
                                _nextQid: nextQid,
                            };
                        }

                        return { queue: [...state.queue, item], _nextQid: nextQid };
                    }),

                playFromQueue: (qid) =>
                    set((state) => {
                        const index = state.queue.findIndex((i) => i.qid === qid);
                        if (index === -1) return state;

                        return {
                            currentIndex: index,
                            currentTrack: state.queue[index].track,
                            currentTime: 0,
                            isPlaying: true,
                        };
                    }),

                removeFromQueue: (qid) =>
                    set((state) => {
                        const index = state.queue.findIndex((i) => i.qid === qid);
                        if (index === -1) return state;

                        const queue = state.queue.filter((i) => i.qid !== qid);

                        if (index < state.currentIndex) {
                            return { queue, currentIndex: state.currentIndex - 1 };
                        }
                        if (index === state.currentIndex) {
                            if (queue.length === 0) {
                                return {
                                    queue: [],
                                    currentIndex: 0,
                                    currentTrack: null,
                                    isPlaying: false,
                                    currentTime: 0,
                                };
                            }
                            const nextIndex = Math.min(index, queue.length - 1);
                            return {
                                queue,
                                currentIndex: nextIndex,
                                currentTrack: queue[nextIndex].track,
                                currentTime: 0,
                            };
                        }
                        return { queue };
                    }),

                clearQueue: () =>
                    set((state) => {
                        if (!state.currentTrack) {
                            return { queue: [], currentIndex: 0 };
                        }

                        const currentItem = state.queue[state.currentIndex];
                        if (!currentItem) {
                            return { queue: [], currentIndex: 0 };
                        }

                        return {
                            queue: [currentItem],
                            currentIndex: 0,
                        };
                    }),

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
                        _nextQid: 0,
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
                    _nextQid: s._nextQid,
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
