import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { playlistKeys, type UpdatePlaylistRequest } from "@/entities/playlist";

export const useUpdateLocalPlaylist = () => {
    return useMutation({
        mutationFn: ({
            playlistId,
            libraryId,
            update,
        }: {
            playlistId: number;
            libraryId?: number;
            update: UpdatePlaylistRequest;
        }) => invoke<number>("update_local_playlist", { playlistId, libraryId, update }),
        onSuccess: async (_data, { playlistId }) => {
            await queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
            await queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) });
        },
    });
};
