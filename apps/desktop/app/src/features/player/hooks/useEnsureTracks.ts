import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/shared/api";
import { fetchLocalTracks, fetchServerTracks, trackKeys, type TrackId } from "@/entities/track";

export const useEnsureTracks = (ids: TrackId[]) => {
    const sortedIds = [...new Set(ids)].sort((a, b) => String(a).localeCompare(String(b)));

    return useQuery({
        queryKey: trackKeys.batch(sortedIds),
        queryFn: async () => {
            const missing = sortedIds.filter(
                (id) => queryClient.getQueryData(trackKeys.detail(id)) === undefined,
            );
            const localIds = missing.filter((id): id is number => typeof id === "number");
            const serverIds = missing.filter((id): id is string => typeof id === "string");

            const [local, server] = await Promise.all([
                localIds.length ? fetchLocalTracks(localIds) : [],
                serverIds.length ? fetchServerTracks(serverIds) : [],
            ]);
            for (const t of [...local, ...server]) {
                queryClient.setQueryData(trackKeys.detail(t.trackId), t);
            }
            return missing.length;
        },
        enabled: sortedIds.length > 0,
        placeholderData: keepPreviousData,
    });
};
