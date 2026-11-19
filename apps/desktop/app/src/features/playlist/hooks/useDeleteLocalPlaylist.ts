import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { playlistKeys } from "@/entities/playlist";

export const useDeleteLocalPlaylist = () => {
    return useMutation({
        mutationFn: (playlistId: number) =>
            invoke<number | null>("delete_local_playlist", { playlistId }),
        onSuccess: async (_data, playlistId) => {
            queryClient.removeQueries({ queryKey: playlistKeys.detail(playlistId) });
            await queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
        },
    });
};
