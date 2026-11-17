import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { playlistKeys, type Playlist } from "@/entities/playlist";

export const useLocalPlaylist = (playlistId: number | null) => {
    return useQuery({
        queryKey: playlistKeys.detail(playlistId!),
        queryFn: () => invoke<Playlist>("get_local_playlist", { playlistId }),
        enabled: playlistId !== null,
    });
};
