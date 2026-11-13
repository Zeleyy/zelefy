import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { trackKeys } from "@/entities/track";
import { selectCurrentTrackId, usePlayerStore } from "../model";

export const useDeleteLocalTrack = () => {
    return useMutation({
        mutationFn: async (trackId: number) => {
            const currentId = selectCurrentTrackId(usePlayerStore.getState());
            if (currentId !== undefined && Number(currentId) === trackId) {
                await invoke("player_unload");
            }
            return invoke<number>("delete_local_track", { trackId });
        },
        onSuccess: (trackId) => {
            usePlayerStore.getState().deleteTrack(trackId);
            queryClient.removeQueries({ queryKey: trackKeys.detail(trackId) });
            queryClient.invalidateQueries({ queryKey: trackKeys.local() });
        },
    });
};
