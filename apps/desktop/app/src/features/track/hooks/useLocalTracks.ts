import type { LocalTrackResponse } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export const useLocalTracks = () => {
    return useQuery({
        queryKey: ["track", "local", "list"],
        queryFn: async () => {
            return await invoke<LocalTrackResponse[]>("get_local_tracks");
        },
    });
};
