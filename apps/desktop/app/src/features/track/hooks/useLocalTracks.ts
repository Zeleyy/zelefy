import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { LocalTrack } from "../types";

export const useLocalTracks = () => {
    return useQuery({
        queryKey: ["track", "local", "list"],
        queryFn: async () => {
            return await invoke<LocalTrack[]>("get_local_tracks");
        },
    });
};
