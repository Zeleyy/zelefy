import { queryOptions } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { playlistKeys } from "./playlistKeys";

export const localPlaylistAllTrackIdsOptions = (playlistId: number) =>
    queryOptions({
        queryKey: playlistKeys.local(playlistId),
        queryFn: () => invoke<number[]>("get_local_playlist_track_ids", { playlistId }),
    });
