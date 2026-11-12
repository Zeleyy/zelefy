import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";
import type { PlayerTrack } from "@zelefy/types";
import { queryClient } from "@/shared/api";
import { tauriStorage } from "../storage";

type RepeatMode = "off" | "queue" | "track";
type TrackId = string | number;

interface QueueItem {
    qid: number;
    trackId: TrackId;
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

    playTrack: (track: PlayerTrack, queueTracks?: PlayerTrack[]) => void;

    previousTrack: () => void;
    nextTrack: () => void;

    patchTrack: (trackId: TrackId, patch: Partial<PlayerTrack>) => void;
    deleteTrack: (trackId: TrackId) => void;

    setQueue: (tracksList: PlayerTrack[]) => void;
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
    "currentTrack" | "queue" | "currentIndex" | "isShuffle" | "repeatMode" | "_nextQid"
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

                playTrack: (track, queueTracks) => {
                    const state = get();
                    if (track.trackId === state.currentTrack?.trackId) return;

                    if (queueTracks) {
                        let nextQid = state._nextQid;
                        const items: QueueItem[] = queueTracks.map((t) => ({
                            qid: nextQid++,
                            trackId: t.trackId,
                        }));
                        const index = items.findIndex((i) => i.trackId === track.trackId);

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

                    const item: QueueItem = { qid: state._nextQid, trackId: track.trackId };
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
                        const prevItem = queue[prevIndex];
                        const track = queryClient.getQueryData<PlayerTrack>([
                            "track",
                            prevItem.trackId,
                        ]);

                        if (track) {
                            set({
                                currentIndex: prevIndex,
                                currentTrack: track,
                                currentTime: 0,
                                isPlaying: true,
                            });
                        }
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
                        const nextItem = queue[nextIndex];
                        const track = queryClient.getQueryData<PlayerTrack>([
                            "track",
                            nextItem.trackId,
                        ]);

                        if (track) {
                            set({
                                currentIndex: nextIndex,
                                currentTrack: track,
                                currentTime: 0,
                                isPlaying: true,
                            });
                        }
                    } else if (repeatMode === "queue") {
                        const firstItem = queue[0];
                        const track = queryClient.getQueryData<PlayerTrack>([
                            "track",
                            firstItem.trackId,
                        ]);

                        if (track) {
                            set({
                                currentIndex: 0,
                                currentTrack: track,
                                currentTime: 0,
                                isPlaying: true,
                            });
                        }
                    } else {
                        set({ isPlaying: false });
                    }
                },

                patchTrack: (trackId, patch) =>
                    set((state) => {
                        queryClient.invalidateQueries({ queryKey: ["track", trackId] });

                        return {
                            currentTrack:
                                state.currentTrack?.trackId === trackId
                                    ? { ...state.currentTrack, ...patch }
                                    : state.currentTrack,
                        };
                    }),

                deleteTrack: (trackId) =>
                    set((state) => {
                        const isRemoved = (t: QueueItem) => t.trackId === trackId;
                        const isCurrent =
                            state.currentTrack != null &&
                            String(state.currentTrack.trackId) === String(trackId);

                        if (!isCurrent && !state.queue.some(isRemoved)) return state;

                        queryClient.removeQueries({ queryKey: ["track", trackId] });

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
                        const track = queryClient.getQueryData<PlayerTrack>([
                            "track",
                            queue[nextIndex].trackId,
                        ]);
                        return {
                            queue,
                            currentIndex: nextIndex,
                            currentTrack: track,
                            currentTime: 0,
                        };
                    }),

                setQueue: (tracksList) =>
                    set((state) => {
                        let nextQid = state._nextQid;
                        const items: QueueItem[] = tracksList.map((t) => ({
                            qid: nextQid++,
                            trackId: t.trackId,
                        }));
                        return {
                            queue: items,
                            currentIndex: 0,
                            _nextQid: nextQid,
                        };
                    }),

                addToQueue: (track) =>
                    set((state) => {
                        const last = state.queue[state.queue.length - 1];
                        if (last && last.trackId === track.trackId) return state;

                        const item: QueueItem = { qid: state._nextQid, trackId: track.trackId };
                        const nextQid = state._nextQid + 1;

                        if (state.queue.length >= 100) {
                            const newIndex = state.currentIndex > 0 ? state.currentIndex - 1 : 0;
                            return {
                                queue: [...state.queue.slice(1), item],
                                currentIndex: newIndex,
                                _nextQid: nextQid,
                            };
                        }

                        return {
                            queue: [...state.queue, item],
                            _nextQid: nextQid,
                        };
                    }),

                playFromQueue: (qid) =>
                    set((state) => {
                        const index = state.queue.findIndex((i) => i.qid === qid);
                        if (index === -1) return state;

                        const trackId = state.queue[index].trackId;

                        const track = queryClient.getQueryData<PlayerTrack>(["track", trackId]);
                        if (!track) return state;

                        return {
                            currentIndex: index,
                            currentTrack: track,
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
