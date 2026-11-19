import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import {
    playlistKeys,
    type NewPlaylistRequest,
    type PlaylistWithFirstTrackId,
} from "@/entities/playlist";

export const useCreateLocalPlaylist = () => {
    return useMutation({
        mutationFn: (newPlaylist: NewPlaylistRequest) =>
            invoke<PlaylistWithFirstTrackId>("create_local_playlist", { new: newPlaylist }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
        },
    });
};
