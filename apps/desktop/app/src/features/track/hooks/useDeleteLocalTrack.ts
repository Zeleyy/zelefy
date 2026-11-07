import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { usePlayerStore } from "@/shared/lib/stores";

export const useDeleteLocalTrack = () => {
    return useMutation({
        mutationFn: async (trackId: number) => {
            const current = usePlayerStore.getState().currentTrack;
            if (current && Number(current.trackId) === trackId) {
                await invoke("player_unload");
            }
            return invoke<number>("delete_local_track", { trackId });
        },
        onSuccess: (trackId) => {
            usePlayerStore.getState().deleteTrack(trackId);
            queryClient.invalidateQueries({ queryKey: ["track", "local"] });
        },
    });
};
