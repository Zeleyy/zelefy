import { useQueries } from "@tanstack/react-query";
import type { PlayerTrack } from "@zelefy/types";
import { trackQueryOptions } from "@/entities/track";
import { usePlayerStore } from "@/features/player";

export const useQueue = () => {
    const queue = usePlayerStore((s) => s.queue);

    const uniqueTrackIds = Array.from(new Set(queue.map((item) => item.trackId)));

    const trackQueries = useQueries({
        queries: uniqueTrackIds.map((trackId) => trackQueryOptions(trackId)),
    });

    const trackMap = new Map<string | number, PlayerTrack>();
    trackQueries.forEach((query) => {
        if (query.data) {
            trackMap.set(query.data.trackId, query.data);
        }
    });

    const resolvedQueue = queue.map((item) => ({
        qid: item.qid,
        trackId: item.trackId,
        track: trackMap.get(item.trackId) || null,
        isLoading: !trackMap.has(item.trackId),
    }));

    const isAnyLoading = trackQueries.some((q) => q.isLoading);

    return {
        queue: resolvedQueue,
        isAnyLoading,
    };
};
