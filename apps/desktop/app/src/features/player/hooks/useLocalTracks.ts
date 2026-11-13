import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { trackKeys, type LocalTrackResponse } from "@/entities/track";

export const useLocalTracks = () => {
    return useQuery({
        queryKey: trackKeys.local(),
        queryFn: async () => {
            return await invoke<LocalTrackResponse[]>("get_local_tracks");
        },
    });
};
