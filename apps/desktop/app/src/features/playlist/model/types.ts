import type { TrackId } from "@/entities/track";

export type ReorderOptions = { onSettled?: () => void };

export type PlaylistBackend<P, T> = {
    fetchAllTrackIds: (playlistId: P) => Promise<T[]>;
    removeTrack: (playlistId: P, trackId: T) => void;
    reorder: (
        playlistId: P,
        loadedIds: T[],
        activeId: T,
        overId: T,
        options?: ReorderOptions,
    ) => boolean;
    deletePlaylist: (playlistId: P) => void;
};

export type PlaylistActions = {
    play: (index?: number) => Promise<void>;
    addAllToQueue: () => Promise<void>;
    removeTrack: (trackId: TrackId) => void;
    reorder: (activeId: TrackId, overId: TrackId, options?: ReorderOptions) => boolean;
    deletePlaylist: () => void;
    edit: () => void;
    addToPlaylist: (trackId: TrackId) => void;
};
