import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";
import type { PlayerTrack } from "@zelefy/types";
import { queryClient } from "@/shared/api";
import { tauriStorage } from "@/shared/lib/storage";
import { trackKeys, type TrackId } from "@/entities/track";

type RepeatMode = "off" | "queue" | "track";

interface QueueItem {
    qid: number;
    trackId: TrackId;
}

interface PlayerState {
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
    "queue" | "currentIndex" | "isShuffle" | "repeatMode" | "_nextQid"
>;

const MAX_QUEUE = 100;

export const selectCurrentTrackId = (
    s: Pick<PlayerState, "queue" | "currentIndex">,
): TrackId | undefined => s.queue[s.currentIndex]?.trackId;

const seedTracks = (tracks: PlayerTrack[]) => {
    for (const track of tracks) {
        const key = trackKeys.detail(track.trackId);
        if (queryClient.getQueryData<PlayerTrack>(key) === undefined) {
            queryClient.setQueryData<PlayerTrack>(key, track);
        }
    }
};

export const usePlayerStore = create<PlayerState>()(
    subscribeWithSelector(
        persist<PlayerState, [], [], PersistedPlayer>(
            (set, get) => ({
                isPlaying: false,
                currentTime: 0,

                queue: [],
                currentIndex: -1,

                isShuffle: false,
                repeatMode: "off",

                _hasHydrated: false,
                _nextQid: 0,

                setIsPlaying: (isPlaying) => set({ isPlaying }),
                togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
                seek: (time) => {
                    if (selectCurrentTrackId(get()) === undefined) return;
                    set({ currentTime: time });
                    void invoke("player_seek", { seconds: time });
                },
                setCurrentTime: (time) => set({ currentTime: time }),

                playTrack: (track, queueTracks) => {
                    const state = get();
                    if (track.trackId === selectCurrentTrackId(state)) return;

                    let list = queueTracks ?? [track];
                    let index = list.findIndex((t) => t.trackId === track.trackId);
                    if (index === -1) {
                        list = [track, ...list];
                        index = 0;
                    }

                    seedTracks(list);

                    let nextQid = state._nextQid;
                    const queue: QueueItem[] = list.map((t) => ({
                        qid: nextQid++,
                        trackId: t.trackId,
                    }));

                    set({
                        queue,
                        currentIndex: index,
                        isPlaying: true,
                        currentTime: 0,
                        _nextQid: nextQid,
                    });
                },

                previousTrack: () => {
                    const { currentIndex } = get();
                    if (currentIndex <= 0) return;

                    set({ currentIndex: currentIndex - 1, currentTime: 0, isPlaying: true });
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
                        set({ currentIndex: nextIndex, currentTime: 0, isPlaying: true });
                    } else if (repeatMode === "queue") {
                        set({ currentIndex: 0, currentTime: 0, isPlaying: true });
                    } else {
                        set({ isPlaying: false });
                    }
                },

                patchTrack: (trackId, patch) => {
                    const key = trackKeys.detail(trackId);
                    queryClient.setQueryData<PlayerTrack>(key, (old) =>
                        old ? { ...old, ...patch } : old,
                    );
                    void queryClient.invalidateQueries({ queryKey: key });
                },

                deleteTrack: (trackId) => {
                    queryClient.removeQueries({ queryKey: trackKeys.detail(trackId) });

                    const state = get();
                    const isRemoved = (item: QueueItem) => item.trackId === trackId;
                    if (!state.queue.some(isRemoved)) return;

                    const queue = state.queue.filter((item) => !isRemoved(item));
                    const current = state.queue[state.currentIndex];

                    if (!current) {
                        set({ queue });
                        return;
                    }

                    const removedBefore = state.queue
                        .slice(0, state.currentIndex)
                        .filter(isRemoved).length;
                    const shiftedIndex = state.currentIndex - removedBefore;

                    if (!isRemoved(current)) {
                        set({ queue, currentIndex: shiftedIndex });
                        return;
                    }

                    if (queue.length === 0) {
                        set({
                            queue: [],
                            currentIndex: -1,
                            isPlaying: false,
                            currentTime: 0,
                        });
                        return;
                    }

                    set({
                        queue,
                        currentIndex: Math.min(shiftedIndex, queue.length - 1),
                        currentTime: 0,
                    });
                },

                setQueue: (tracksList) => {
                    seedTracks(tracksList);

                    set((state) => {
                        let nextQid = state._nextQid;
                        const items: QueueItem[] = tracksList.map((t) => ({
                            qid: nextQid++,
                            trackId: t.trackId,
                        }));

                        if (items.length === 0) {
                            return {
                                queue: [],
                                currentIndex: -1,
                                isPlaying: false,
                                currentTime: 0,
                            };
                        }

                        return {
                            queue: items,
                            currentIndex: state.currentIndex < 0 ? -1 : 0,
                            currentTime: 0,
                            _nextQid: nextQid,
                        };
                    });
                },

                addToQueue: (track) => {
                    seedTracks([track]);

                    set((state) => {
                        const last = state.queue[state.queue.length - 1];
                        if (last && last.trackId === track.trackId) return state;

                        const item: QueueItem = { qid: state._nextQid, trackId: track.trackId };
                        const nextQid = state._nextQid + 1;

                        if (state.queue.length >= MAX_QUEUE) {
                            const dropIndex = state.currentIndex === 0 ? 1 : 0;
                            return {
                                queue: [...state.queue.filter((_, i) => i !== dropIndex), item],
                                currentIndex:
                                    state.currentIndex > dropIndex
                                        ? state.currentIndex - 1
                                        : state.currentIndex,
                                _nextQid: nextQid,
                            };
                        }

                        return {
                            queue: [...state.queue, item],
                            _nextQid: nextQid,
                        };
                    });
                },

                playFromQueue: (qid) =>
                    set((state) => {
                        const index = state.queue.findIndex((i) => i.qid === qid);
                        if (index === -1) return state;

                        return { currentIndex: index, currentTime: 0, isPlaying: true };
                    }),

                removeFromQueue: (qid) =>
                    set((state) => {
                        const index = state.queue.findIndex((i) => i.qid === qid);
                        if (index === -1) return state;

                        const queue = state.queue.filter((i) => i.qid !== qid);

                        if (index < state.currentIndex) {
                            return { queue, currentIndex: state.currentIndex - 1 };
                        }
                        if (index > state.currentIndex) {
                            return { queue };
                        }

                        if (queue.length === 0) {
                            return {
                                queue: [],
                                currentIndex: -1,
                                isPlaying: false,
                                currentTime: 0,
                            };
                        }
                        return {
                            queue,
                            currentIndex: Math.min(index, queue.length - 1),
                            currentTime: 0,
                        };
                    }),

                clearQueue: () =>
                    set((state) => {
                        const current = state.queue[state.currentIndex];
                        return current
                            ? { queue: [current], currentIndex: 0 }
                            : { queue: [], currentIndex: -1 };
                    }),

                toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

                toggleRepeat: () => {
                    const modes: RepeatMode[] = ["off", "queue", "track"];
                    const nextMode = modes[(modes.indexOf(get().repeatMode) + 1) % modes.length];
                    set({ repeatMode: nextMode });
                },

                resetPlayer: () =>
                    set({
                        isPlaying: false,
                        currentTime: 0,
                        queue: [],
                        currentIndex: -1,
                        _nextQid: 0,
                    }),

                setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
            }),
            {
                name: "player",
                partialize: (s) => ({
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
