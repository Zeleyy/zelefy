import type { PlaylistId } from "../model";

export const playlistKeys = {
    all: ["playlist"] as const,

    details: () => [...playlistKeys.all, "detail"] as const,
    detail: (playlistId: PlaylistId) => [...playlistKeys.details(), playlistId] as const,

    lists: () => [...playlistKeys.all, "list"] as const,
    listsWithFirstTrackId: () => [...playlistKeys.lists(), "with-first-track"] as const,

    feeds: () => [...playlistKeys.all, "feed"] as const,

    localFeeds: () => [...playlistKeys.feeds(), "local"] as const,
    localFeed: (search: string) => [...playlistKeys.localFeeds(), { search }] as const,
    remoteFeeds: () => [...playlistKeys.feeds(), "remote"] as const,
    remoteFeed: (search: string) => [...playlistKeys.remoteFeeds(), { search }] as const,

    trackIds: () => [...playlistKeys.all, "track-ids"] as const,
    trackIdsOf: (playlistId: PlaylistId) => [...playlistKeys.trackIds(), playlistId] as const,

    feed: (playlistId: PlaylistId) => [...playlistKeys.feeds(), playlistId] as const,
};
