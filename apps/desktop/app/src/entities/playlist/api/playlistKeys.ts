import type { PlaylistId } from "../model";

export const playlistKeys = {
    all: ["playlist"] as const,

    lists: () => [...playlistKeys.all, "list"] as const,
    listsWithFirstTrackId: () => [...playlistKeys.lists(), "with-first-track"] as const,

    details: () => [...playlistKeys.all, "detail"] as const,
    detail: (playlistId: PlaylistId) => [...playlistKeys.details(), playlistId] as const,

    trackIds: () => [...playlistKeys.all, "track-ids"] as const,
    trackIdsOf: (playlistId: PlaylistId) => [...playlistKeys.trackIds(), playlistId] as const,

    feeds: () => [...playlistKeys.all, "feed"] as const,
    feed: (playlistId: PlaylistId) => [...playlistKeys.feeds(), playlistId] as const,
};
