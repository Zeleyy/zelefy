import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { playlistKeys, type PlaylistWithFirstTrackId } from "@/entities/playlist";
import { useEnsureTracks } from "@/features/player";

export const useLocalPlaylistsWithFirstTrackId = () => {
    const query = useQuery({
        queryKey: playlistKeys.localWithFirstTrackId(),
        queryFn: () => invoke<PlaylistWithFirstTrackId[]>("get_local_playlists_with_first_track"),
    });

    const firstTrackIds = query.data
        ?.map((p) => p.trackId)
        .filter((id): id is NonNullable<typeof id> => id != null);

    useEnsureTracks(firstTrackIds ?? []);

    return query;
};
