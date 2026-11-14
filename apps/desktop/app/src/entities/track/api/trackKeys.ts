import type { TrackId } from "./trackQuery";

export const trackKeys = {
    all: ["track"] as const,
    lists: () => [...trackKeys.all, "list"] as const,
    details: () => [...trackKeys.all, "detail"] as const,
    detail: (trackId: TrackId) => [...trackKeys.details(), trackId] as const,
    batch: (ids: TrackId[]) => [...trackKeys.all, "batch", ids] as const,
    local: () => [...trackKeys.all, "local"] as const,
    localDetail: (trackId: number) => [...trackKeys.local(), trackId] as const,
};
