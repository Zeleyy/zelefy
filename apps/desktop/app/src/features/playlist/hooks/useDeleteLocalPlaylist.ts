import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { playlistKeys } from "@/entities/playlist";

export const useDeleteLocalPlaylist = () => {
    return useMutation({
        mutationFn: (playlistId: number) => invoke<number>("delete_local_playlist", { playlistId }),
        onSettled: (deletedId) => {
            if (!deletedId) return;

            queryClient.removeQueries({ queryKey: playlistKeys.detail(deletedId) });
            queryClient.invalidateQueries({ queryKey: playlistKeys.locals() });
        },
    });
};
