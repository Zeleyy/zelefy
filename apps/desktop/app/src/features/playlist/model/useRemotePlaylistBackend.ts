import { useMemo } from "react";
import type { PlaylistBackend } from "./types";

export const useRemotePlaylistBackend = (): PlaylistBackend<string, string> =>
    useMemo(
        () => ({
            fetchAllTrackIds: async () => [], // TODO
            removeTrack: () => {}, // TODO
            reorder: () => false, // TODO
            deletePlaylist: () => {}, // TODO
        }),
        [],
    );
