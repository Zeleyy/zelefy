import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";
import type { PlayerTrack, TrackId } from "@zelefy/types";
import { queryClient } from "@/shared/api";
import { tauriStorage } from "@/shared/lib/storage";
import { trackKeys } from "@/entities/track";
import type { PlaylistId } from "@/entities/playlist";

type RepeatMode = "off" | "queue" | "track";
type AddResult = "added" | "replaced" | "noop";
type BatchAddResult = {
    added: number;
    dropped: number;
    skipped: number;
};

interface QueueItem {
    qid: number;
    trackId: TrackId;
    playlistId?: PlaylistId;
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

    playTrack: (trackId: TrackId, trackIds?: TrackId[], playlistId?: PlaylistId) => void;

    previousTrack: () => void;
    nextTrack: () => void;

    patchTrack: (trackId: TrackId, patch: Partial<PlayerTrack>) => void;
    deleteTrack: (trackId: TrackId) => void;

    setQueue: (tracksIds: TrackId[], playlistId?: PlaylistId) => void;
    addToQueue: (trackId: TrackId, playlistId?: PlaylistId) => AddResult;
    addManyToQueue: (trackIds: TrackId[], playlistId?: PlaylistId) => BatchAddResult;
    replaceTrack: (movingQid?: number, afterQid?: number, beforeQid?: number) => void;
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

const MAX_QUEUE = 300;

export const selectCurrentTrackId = (
    s: Pick<PlayerState, "queue" | "currentIndex">,
): TrackId | undefined => s.queue[s.currentIndex]?.trackId;

export const selectCurrentPlaylistId = (
    s: Pick<PlayerState, "queue" | "currentIndex">,
): PlaylistId | undefined => s.queue[s.currentIndex]?.playlistId;

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

                playTrack: (trackId, trackIds, playlistId) => {
                    const state = get();
                    if (
                        trackId === selectCurrentTrackId(state) &&
                        playlistId === selectCurrentPlaylistId(state)
                    )
                        return;

                    let list = trackIds ?? [trackId];
                    let index = list.findIndex((t) => t === trackId);
                    if (index === -1) {
                        list = [trackId, ...list];
                        index = 0;
                    }

                    let nextQid = state._nextQid;
                    const queue: QueueItem[] = list.map((id) => ({
                        qid: nextQid++,
                        trackId: id,
                        playlistId,
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

                setQueue: (trackIds, playlistId) => {
                    set((state) => {
                        let nextQid = state._nextQid;
                        const items: QueueItem[] = trackIds.map((id) => ({
                            qid: nextQid++,
                            trackId: id,
                            playlistId,
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

                addToQueue: (trackId) => {
                    let result: AddResult = "noop";

                    set((state) => {
                        const item: QueueItem = { qid: state._nextQid, trackId };
                        const nextQid = state._nextQid + 1;

                        if (state.queue.length >= MAX_QUEUE) {
                            result = "replaced";
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

                        result = "added";
                        return {
                            queue: [...state.queue, item],
                            _nextQid: nextQid,
                        };
                    });

                    return result;
                },

                addManyToQueue: (trackIds, playlistId) => {
                    const result: BatchAddResult = { added: 0, dropped: 0, skipped: 0 };
                    if (trackIds.length === 0) return result;

                    set((state) => {
                        let queue = state.queue.slice();
                        let currentIndex = state.currentIndex;
                        let nextQid = state._nextQid;
                        let dropped = 0;

                        for (const trackId of trackIds) {
                            const item: QueueItem = { qid: nextQid++, trackId, playlistId };

                            if (queue.length < MAX_QUEUE) {
                                queue.push(item);
                                result.added++;
                                continue;
                            }

                            let dropIndex: number;
                            if (currentIndex <= 0) {
                                dropIndex = currentIndex === 0 ? 1 : 0;
                            } else {
                                dropIndex = 0;
                            }

                            if (dropIndex === currentIndex) {
                                dropIndex = currentIndex === 0 ? 1 : 0;
                            }

                            queue.splice(dropIndex, 1);
                            if (currentIndex > dropIndex) currentIndex--;

                            queue.push(item);
                            dropped++;
                            result.added++;
                        }

                        result.dropped = dropped;

                        return {
                            queue,
                            currentIndex,
                            _nextQid: nextQid,
                        };
                    });

                    return result;
                },

                replaceTrack: (movingQid, afterQid, beforeQid) =>
                    set((state) => {
                        const queue = [...state.queue];

                        const movingIndex = queue.findIndex((item) => item.qid === movingQid);
                        if (movingIndex === -1) return state;

                        const anchorQid = afterQid ?? beforeQid;
                        if (!anchorQid || anchorQid === movingQid) return state;

                        const anchorIndex = queue.findIndex((item) => item.qid === anchorQid);
                        if (anchorIndex === -1) return state;

                        if (afterQid !== undefined && anchorIndex === movingIndex - 1) return state;
                        if (beforeQid !== undefined && anchorIndex === movingIndex + 1)
                            return state;

                        const [movingItem] = queue.splice(movingIndex, 1);

                        const adjustedAnchorIndex =
                            anchorIndex > movingIndex ? anchorIndex - 1 : anchorIndex;
                        const insertIndex =
                            afterQid !== undefined ? adjustedAnchorIndex + 1 : adjustedAnchorIndex;

                        queue.splice(insertIndex, 0, movingItem);

                        let newCurrentIndex = state.currentIndex;
                        if (state.currentIndex !== -1) {
                            if (movingIndex === state.currentIndex) {
                                newCurrentIndex = insertIndex;
                            } else {
                                const currAfterRemove =
                                    movingIndex < state.currentIndex
                                        ? state.currentIndex - 1
                                        : state.currentIndex;
                                newCurrentIndex =
                                    insertIndex <= currAfterRemove
                                        ? currAfterRemove + 1
                                        : currAfterRemove;
                            }
                        }

                        return { queue, currentIndex: newCurrentIndex };
                    }),

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
