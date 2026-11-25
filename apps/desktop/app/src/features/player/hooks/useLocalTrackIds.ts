import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { trackKeys, type LocalTrackCursor, type LocalTrackIdsPage } from "@/entities/track";
import { useEnsureTracks } from "./useEnsureTracks";

export const useLocalTrackIds = ({ search = "", enabled = true }) => {
    const normalized = search.trim().replace(/\s+/g, " ").toLowerCase();

    const query = useInfiniteQuery({
        queryKey: trackKeys.localIdsFeed(normalized),
        queryFn: async ({ pageParam }: { pageParam: LocalTrackCursor | null }) => {
            return invoke<LocalTrackIdsPage>("get_local_track_ids_paged", {
                search: normalized === "" ? null : normalized,
                after: pageParam,
                limit: 20,
            });
        },
        initialPageParam: null as LocalTrackCursor | null,
        getNextPageParam: (lastPage, allPages) => {
            const next = lastPage.nextCursor;
            if (!next) return undefined;
            const seen = allPages.slice(0, -1).some((p) => p.nextCursor?.trackId == next.trackId);
            return seen ? undefined : next;
        },
        enabled,
        placeholderData: keepPreviousData,
    });

    const trackIds = query.data?.pages
        .flatMap((p) => p.items)
        .filter((id): id is NonNullable<typeof id> => id != null);
    useEnsureTracks(trackIds ?? []);

    return query;
};
