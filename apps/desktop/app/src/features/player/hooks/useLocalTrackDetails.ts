import { trackKeys, type LocalTrackResponse } from "@/entities/track";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export const useLocalTrackDetails = (trackId: number | null) => {
    return useQuery({
        queryKey: trackKeys.localDetail(trackId!),
        queryFn: () => invoke<LocalTrackResponse>("get_local_track", { trackId }),
        enabled: trackId !== null,
    });
};
