import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { toPlayerTrack, type LocalTrackResponse, type UpdateTrackRequest } from "@/entities/track";
import { usePlayerStore } from "../model";

export const useUpdateLocalTrack = () => {
    return useMutation({
        mutationFn: ({ trackId, update }: { trackId: number; update: UpdateTrackRequest }) =>
            invoke<LocalTrackResponse>("update_local_track", { trackId, update }),
        onSuccess: (track) => {
            usePlayerStore.getState().patchTrack(track.trackId, toPlayerTrack(track));
        },
    });
};
