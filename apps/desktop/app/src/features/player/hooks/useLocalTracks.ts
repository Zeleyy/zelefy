import { useInfiniteQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { trackKeys, type LocalTrackCursor, type LocalTracksPage } from "@/entities/track";
import { useEnsureTracks } from "./useEnsureTracks";

export const useLocalTracks = ({ search = "" }) => {
    const normalized = search.trim();

    const query = useInfiniteQuery({
        queryKey: trackKeys.feed(normalized),
        queryFn: async ({ pageParam }: { pageParam: LocalTrackCursor | null }) => {
            return invoke<LocalTracksPage>("get_local_tracks_paged", {
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
    });

    const trackIds = query.data?.pages
        .flatMap((p) => p.items.map((i) => i.trackId))
        .filter((id): id is NonNullable<typeof id> => id != null);
    useEnsureTracks(trackIds ?? []);

    return query;
};
