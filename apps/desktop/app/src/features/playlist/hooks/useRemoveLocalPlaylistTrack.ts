import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { playlistKeys } from "@/entities/playlist";

export const useRemoveLocalPlaylistTrack = () => {
    return useMutation({
        mutationFn: ({ playlistId, trackId }: { playlistId: number; trackId: number }) =>
            invoke<number | null>("remove_local_playlist_track", { playlistId, trackId }),
        onSuccess: (_data, { playlistId }) => {
            queryClient.invalidateQueries({ queryKey: playlistKeys.feed(playlistId) });
            queryClient.invalidateQueries({ queryKey: playlistKeys.trackIdsOf(playlistId) });
        },
    });
};
