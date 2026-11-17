import { useQuery } from "@tanstack/react-query";
import { localPlaylistAllTrackIdsOptions } from "@/entities/playlist";

export const useLocalPlaylistAllTrackIds = (playlistId: number) => {
    return useQuery(localPlaylistAllTrackIdsOptions(playlistId));
};
