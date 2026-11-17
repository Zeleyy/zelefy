import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import { playlistKeys, type Playlist } from "@/entities/playlist";

export const useLocalPlaylists = () => {
    return useQuery({
        queryKey: playlistKeys.locals(),
        queryFn: () => invoke<Playlist[]>("get_local_playlists"),
    });
};
