import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { playlistKeys } from "@/entities/playlist";

export const useAddLocalPlaylistEnd = () => {
    return useMutation({
        mutationFn: ({ playlistId, trackId }: { playlistId: number; trackId: number }) =>
            invoke<number>("add_track_to_playlist_end", { playlistId, trackId }),
        onSettled: (playlistId) => {
            if (playlistId) {
                queryClient.invalidateQueries({ queryKey: playlistKeys.feed(playlistId) });
            }
        },
    });
};
