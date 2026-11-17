import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { trackKeys, type LocalTrackIdResponse } from "@/entities/track";
import { useEnsureTracks } from "./useEnsureTracks";

export const useLocalTracks = () => {
    const query = useQuery({
        queryKey: trackKeys.local(),
        queryFn: async () => {
            return await invoke<LocalTrackIdResponse[]>("get_local_tracks_ids");
        },
        gcTime: 1000 * 60 * 10,
    });

    const trackIds = query.data?.map((t) => t.trackId);
    useEnsureTracks(trackIds ?? []);

    return query;
};
