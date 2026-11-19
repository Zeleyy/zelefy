import type { TrackId } from "../model";

export const trackKeys = {
    all: ["track"] as const,

    lists: () => [...trackKeys.all, "list"] as const,

    details: () => [...trackKeys.all, "detail"] as const,
    detail: (trackId: TrackId) => [...trackKeys.details(), trackId] as const,

    batch: (ids: TrackId[]) => [...trackKeys.all, "batch", ids] as const,

    locals: () => [...trackKeys.lists(), "local"] as const,

    feeds: () => [...trackKeys.all, "feed"] as const,
};
