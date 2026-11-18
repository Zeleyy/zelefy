import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { playlistKeys, type UpdatePlaylist } from "@/entities/playlist";

export const useUpdateLocalPlaylist = () => {
    return useMutation({
        mutationFn: ({ playlistId, update }: { playlistId: number; update: UpdatePlaylist }) =>
            invoke<number>("update_local_playlist", { playlistId, update }),
        onSuccess: (_data, { playlistId }) => {
            queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
            queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) });
        },
    });
};
