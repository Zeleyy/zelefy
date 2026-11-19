import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useModalStore } from "@/shared/lib/stores";
import type { Playlist, PlaylistId } from "@/entities/playlist";
import type { TrackId } from "@/entities/track";
import { usePlayerStore } from "@/features/player";
import { useAddManyToQueue } from "@/features/queue";
import { useLocalPlaylistBackend } from "./useLocalPlaylistBackend";
import { useRemotePlaylistBackend } from "./useRemotePlaylistBackend";
import type { PlaylistActions, ReorderOptions } from "./types";

const isNumber = (v: unknown): v is number => typeof v === "number";
const isString = (v: unknown): v is string => typeof v === "string";

export const usePlaylistActions = (
    playlistId: PlaylistId,
    playlist?: Playlist,
    loadedTrackIds: TrackId[] = [],
): PlaylistActions => {
    const navigate = useNavigate();
    const openModal = useModalStore((s) => s.openModal);
    const playTrack = usePlayerStore((s) => s.playTrack);
    const addManyToQueue = useAddManyToQueue();
    const local = useLocalPlaylistBackend();
    const remote = useRemotePlaylistBackend();

    const fetchAllTrackIds = useCallback(
        (): Promise<TrackId[]> =>
            isNumber(playlistId)
                ? local.fetchAllTrackIds(playlistId)
                : remote.fetchAllTrackIds(playlistId),
        [playlistId, local, remote],
    );

    const removeTrack = useCallback(
        (trackId: TrackId) => {
            if (isNumber(playlistId)) {
                if (isNumber(trackId)) local.removeTrack(playlistId, trackId);
            } else if (isString(trackId)) {
                remote.removeTrack(playlistId, trackId);
            }
        },
        [playlistId, local, remote],
    );

    const reorder = useCallback(
        (activeId: TrackId, overId: TrackId, options?: ReorderOptions) => {
            if (isNumber(playlistId)) {
                if (!isNumber(activeId) || !isNumber(overId)) return false;
                return local.reorder(
                    playlistId,
                    loadedTrackIds.filter(isNumber),
                    activeId,
                    overId,
                    options,
                );
            }
            if (!isString(activeId) || !isString(overId)) return false;
            return remote.reorder(
                playlistId,
                loadedTrackIds.filter(isString),
                activeId,
                overId,
                options,
            );
        },
        [playlistId, loadedTrackIds, local, remote],
    );

    const deletePlaylist = useCallback(() => {
        if (!playlist) return;
        void navigate("/", { replace: true });
        if (isNumber(playlistId)) local.deletePlaylist(playlistId);
        else remote.deletePlaylist(playlistId);
    }, [playlistId, playlist, navigate, local, remote]);

    const play = useCallback(
        async (index = 0) => {
            const ids = await fetchAllTrackIds();
            if (!ids.length) return;
            playTrack(ids[index], ids, playlistId);
        },
        [fetchAllTrackIds, playTrack, playlistId],
    );

    const addAllToQueue = useCallback(async () => {
        if (!playlist) return;
        const ids = await fetchAllTrackIds();
        if (!ids.length) return;
        addManyToQueue(ids, playlist);
    }, [fetchAllTrackIds, addManyToQueue, playlist]);

    const edit = useCallback(
        () => openModal("editPlaylist", { playlistId }),
        [openModal, playlistId],
    );

    const addToPlaylist = useCallback(
        (trackId: TrackId) => openModal("addToPlaylist", { trackId }),
        [openModal],
    );

    return useMemo(
        () => ({ play, addAllToQueue, removeTrack, reorder, deletePlaylist, edit, addToPlaylist }),
        [play, addAllToQueue, removeTrack, reorder, deletePlaylist, edit, addToPlaylist],
    );
};
