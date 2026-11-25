import type { TrackId } from "@zelefy/types";

export const trackKeys = {
    all: ["track"] as const,

    details: () => [...trackKeys.all, "detail"] as const,
    detail: (trackId: TrackId) => [...trackKeys.details(), trackId] as const,
    localDetail: (trackId: TrackId) => [...trackKeys.detail(trackId), "local"] as const,
    batch: (ids: TrackId[]) => [...trackKeys.all, "batch", ids] as const,

    feeds: () => [...trackKeys.all, "feed"] as const,

    localFeeds: () => [...trackKeys.feeds(), "local"] as const,
    localFeed: (search: string) => [...trackKeys.localFeeds(), { search }] as const,
    localIdsFeed: (search: string) => [...trackKeys.localFeeds(), "ids", { search }] as const,

    remoteFeeds: () => [...trackKeys.feeds(), "remote"] as const,
    remoteFeed: (search: string) => [...trackKeys.remoteFeeds(), { search }] as const,
    remoteIdsFeed: (search: string) => [...trackKeys.remoteFeeds(), "ids", { search }] as const,
};
