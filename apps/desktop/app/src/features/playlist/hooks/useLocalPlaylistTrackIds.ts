import { useInfiniteQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import {
    playlistKeys,
    type PlaylistTrackCursor,
    type PlaylistTracksPage,
} from "@/entities/playlist";
import { useEnsureTracks } from "@/features/player";

export const useLocalPlaylistTrackIds = (playlistId: number | null) => {
    const query = useInfiniteQuery({
        queryKey: playlistKeys.feed(playlistId!),
        queryFn: async ({ pageParam }: { pageParam: PlaylistTrackCursor | null }) => {
            return invoke<PlaylistTracksPage>("get_local_playlist_tracks_paged", {
                playlistId,
                after: pageParam,
                limit: 20,
            });
        },
        initialPageParam: null as PlaylistTrackCursor | null,
        getNextPageParam: (lastPage, allPages) => {
            const next = lastPage.nextCursor;
            if (!next) return undefined;
            const seen = allPages.slice(0, -1).some((p) => p.nextCursor?.position == next.position);
            return seen ? undefined : next;
        },
        enabled: playlistId !== null,
    });

    const trackIds = query.data?.pages
        .flatMap((p) => p.items.map((i) => i.trackId))
        .filter((id): id is NonNullable<typeof id> => id != null);
    useEnsureTracks(trackIds ?? []);

    return query;
};
