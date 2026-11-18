import { useMemo } from "react";
import { queryClient } from "@/shared/api";
import { localPlaylistAllTrackIdsOptions } from "@/entities/playlist";
import {
    useDeleteLocalPlaylist,
    useRemoveLocalPlaylistTrack,
    useReplaceLocalPlaylistTrack,
} from "@/features/playlist";
import { getMoveNeighbors } from "../lib/getMoveNeighbors";
import type { PlaylistBackend } from "./types";

export const useLocalPlaylistBackend = (): PlaylistBackend<number, number> => {
    const { mutate: deleteLocal } = useDeleteLocalPlaylist();
    const { mutate: removeLocal } = useRemoveLocalPlaylistTrack();
    const { mutate: replaceLocal } = useReplaceLocalPlaylistTrack();

    return useMemo(
        () => ({
            fetchAllTrackIds: async (playlistId) =>
                (await queryClient.query(localPlaylistAllTrackIdsOptions(playlistId))) ?? [],

            removeTrack: (playlistId, trackId) => removeLocal({ playlistId, trackId }),

            reorder: (playlistId, loadedIds, activeId, overId, options) => {
                const n = getMoveNeighbors(loadedIds, activeId, overId);
                if (!n) return false;
                replaceLocal(
                    {
                        playlistId,
                        request: { trackId: activeId, afterTrackId: n.prev, beforeTrackId: n.next },
                    },
                    options,
                );
                return true;
            },

            deletePlaylist: (playlistId) => deleteLocal(playlistId),
        }),
        [deleteLocal, removeLocal, replaceLocal],
    );
};
