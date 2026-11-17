import type { PlaylistId } from "../model";

export const playlistKeys = {
    all: ["playlist"] as const,
    lists: () => [...playlistKeys.all, "list"] as const,
    locals: () => [...playlistKeys.all, "local"] as const,
    local: (playlistId: PlaylistId) => [...playlistKeys.locals(), playlistId] as const,
    localWithFirstTrackId: () => [...playlistKeys.locals(), "id"],
    feeds: () => [...playlistKeys.all, "feed"] as const,
    feed: (playlistId: PlaylistId) => [...playlistKeys.feeds(), playlistId] as const,
    details: () => [...playlistKeys.all, "detail"] as const,
    detail: (playlistId: PlaylistId) => [...playlistKeys.details(), playlistId] as const,
};
