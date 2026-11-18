import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { playlistKeys, type MoveTrackRequest } from "@/entities/playlist";

const MUTATION_KEY = ["playlist", "local", "replace-track"] as const;

export const useReplaceLocalPlaylistTrack = () => {
    return useMutation({
        mutationKey: MUTATION_KEY,
        mutationFn: ({ playlistId, request }: { playlistId: number; request: MoveTrackRequest }) =>
            invoke("replace_local_playlist_track", { playlistId, request }),

        onSettled: (_data, _err, { playlistId }) => {
            if (queryClient.isMutating({ mutationKey: MUTATION_KEY }) > 1) return;
            return Promise.all([
                queryClient.invalidateQueries({ queryKey: playlistKeys.feed(playlistId) }),
                queryClient.invalidateQueries({ queryKey: playlistKeys.trackIdsOf(playlistId) }),
            ]);
        },
    });
};
