import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { playlistKeys } from "@/entities/playlist";

export const useAddLocalPlaylistEnd = () => {
    return useMutation({
        mutationFn: ({ playlistId, trackId }: { playlistId: number; trackId: number }) =>
            invoke<number>("add_local_playlist_track_end", { playlistId, trackId }),
        onSettled: (_data, _error, { playlistId }) => {
            queryClient.invalidateQueries({ queryKey: playlistKeys.feed(playlistId) });
            queryClient.invalidateQueries({ queryKey: playlistKeys.trackIdsOf(playlistId) });
        },
    });
};
