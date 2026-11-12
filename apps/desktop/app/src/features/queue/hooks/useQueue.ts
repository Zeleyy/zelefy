import { usePlayerStore } from "@/shared/lib/stores";
import { toPlayerTrack, type LocalTrackResponse } from "@/shared/types";
import { useQueries } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { PlayerTrack } from "@zelefy/types";

export const useQueue = () => {
    const queue = usePlayerStore((s) => s.queue);

    const uniqueTrackIds = Array.from(new Set(queue.map((item) => item.trackId)));

    const trackQueries = useQueries({
        queries: uniqueTrackIds.map((trackId) => ({
            queryKey: ["track", trackId],
            queryFn: async () => {
                if (typeof trackId === "number") {
                    return toPlayerTrack(
                        await invoke<LocalTrackResponse>("get_local_track", { trackId }),
                    );
                } else {
                    // TODO: Получение с сервера
                }
            },
            staleTime: 1000 * 60 * 10,
            gcTime: 1000 * 60 * 30,
        })),
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
