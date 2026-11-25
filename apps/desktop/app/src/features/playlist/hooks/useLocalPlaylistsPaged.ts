import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { playlistKeys, type PlaylistCursor, type PlaylistsPage } from "@/entities/playlist";
import { useEnsureTracks } from "@/features/player";

export const useLocalPlaylistsPaged = ({ search = "", enabled = true }) => {
    const normalized = search.trim().replace(/\s+/g, " ").toLowerCase();

    const query = useInfiniteQuery({
        queryKey: playlistKeys.localFeed(normalized),
        queryFn: async ({ pageParam }: { pageParam: PlaylistCursor | null }) => {
            return invoke<PlaylistsPage>("get_local_playlists_paged", {
                search: normalized === "" ? null : normalized,
                after: pageParam,
                limit: 20,
            });
        },
        initialPageParam: null as PlaylistCursor | null,
        getNextPageParam: (lastPage, allPages) => {
            const next = lastPage.nextCursor;
            if (!next) return undefined;
            const seen = allPages
                .slice(0, -1)
                .some((p) => p.nextCursor?.playlistId == next.playlistId);
            return seen ? undefined : next;
        },
        enabled,
        placeholderData: keepPreviousData,
    });

    const trackIds = query.data?.pages
        .flatMap((page) => page.items ?? [])
        .flatMap((item) => item.trackIds ?? [])
        .filter((id): id is NonNullable<typeof id> => id != null);

    useEnsureTracks(trackIds ?? []);

    return query;
};
