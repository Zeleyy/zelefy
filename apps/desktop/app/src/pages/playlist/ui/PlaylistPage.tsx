import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import type { TrackId } from "@zelefy/types";
import {
    Button,
    DraggableItem,
    DraggableList,
    EmptyState,
    Flex,
    Icon,
    SpinnerLoader,
} from "@zelefy/ui";
import { InfiniteScrollFooter } from "@/shared/ui";
import { confirm, useModalStore } from "@/shared/lib/stores";
import { useOptimisticOrder } from "@/shared/lib/hooks";
import { type PlaylistId } from "@/entities/playlist";
import {
    useLocalPlaylist,
    useLocalPlaylistTrackIds,
    usePlaylistActions,
} from "@/features/playlist";
import { useWaveform } from "@/features/waveform";
import {
    PlayerTrackHero,
    selectCurrentPlaylistId,
    selectCurrentTrackId,
    usePlayerStore,
    useTrack,
} from "@/features/player";
import { useAddToQueue } from "@/features/queue";
import { PlaylistTrackRow } from "@/widgets/playlist-tracks";

export const PlaylistPage = () => {
    const { t } = useTranslation();
    const { playlistId } = useLoaderData<{ playlistId: PlaylistId }>();
    const localId = typeof playlistId === "number" ? playlistId : undefined;

    const openModal = useModalStore((s) => s.openModal);
    const addToQueue = useAddToQueue();

    const { data: playlist } = useLocalPlaylist(localId ?? null);
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
        useLocalPlaylistTrackIds(localId ?? null);

    const isLocal = typeof playlistId === "number";

    const serverIds = useMemo<TrackId[]>(
        () => data?.pages.flatMap((p) => p.items.map((i) => i.trackId)) ?? [],
        [data],
    );
    const { ids, move, settle } = useOptimisticOrder(serverIds);
    const trackIds = ids;

    const { play, addAllToQueue, removeTrack, reorder, deletePlaylist, edit, addToPlaylist } =
        usePlaylistActions(playlistId, playlist, trackIds);

    const handleReorder = useCallback(
        (activeId: TrackId, overId: TrackId) => {
            if (reorder(activeId, overId, { onSettled: settle })) {
                move(activeId, overId);
            }
        },
        [reorder, settle, move],
    );

    const handleDeletePlaylist = useCallback(async () => {
        if (!playlist) return;
        const ok = await confirm({
            title: t("playlist.delete.title"),
            description: t("playlist.delete.description", { title: playlist.title }),
            confirmLabel: t("common.delete"),
            cancelLabel: t("common.cancel"),
            variant: "danger",
        });
        if (!ok) return;
        deletePlaylist();
    }, [t, playlist, deletePlaylist]);

    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const currentTrackId = usePlayerStore(selectCurrentTrackId);
    const isCurrentPlaylist = usePlayerStore(selectCurrentPlaylistId) === playlistId;

    const heroTrackId = isCurrentPlaylist ? currentTrackId : trackIds[0];
    const { data: track } = useTrack(heroTrackId);
    const { data: waveform } = useWaveform(track?.waveformSrc);

    const handleRowClick = useCallback(
        (index: number) => {
            const trackId = trackIds[index];
            if (trackId === undefined) return;
            if (isCurrentPlaylist && currentTrackId === trackId) togglePlay();
            else void play(index);
        },
        [trackIds, isCurrentPlaylist, currentTrackId, togglePlay, play],
    );

    if (typeof playlistId === "string") return <EmptyState title="Not supported yet" />; // TODO remote
    if (isLoading) return <SpinnerLoader isLoading />;
    if (isError) return <EmptyState title={t("playlist.list.error")} description={String(error)} />;
    if (trackIds.length === 0) return <EmptyState title={t("playlist.list.empty")} />;

    return (
        <>
            <PlayerTrackHero
                track={track}
                isCurrentTrack={isCurrentPlaylist}
                waveformData={waveform}
                onTogglePlay={() => void (isCurrentPlaylist ? togglePlay() : play())}
                onAddToPlaylistClick={() => {
                    if (!track?.trackId) return;
                    openModal("addToPlaylist", { trackId: track.trackId });
                }}
                onAddToQueueClick={() => {
                    if (!track) return;
                    addToQueue(track);
                }}
            />

            <Flex gap="xs">
                <Button variant="secondary" onClick={edit}>
                    <Icon name="action-edit" size={20} />
                </Button>
                <Button variant="secondary" onClick={() => void addAllToQueue()}>
                    <Icon name="player-list-end" size={20} />
                </Button>
                <Button variant="secondary" onClick={() => void handleDeletePlaylist()}>
                    <Icon name="action-delete" size={20} />
                </Button>
            </Flex>

            <DraggableList<TrackId> items={trackIds} onReorder={handleReorder}>
                <Flex direction="column" gap="xs">
                    {trackIds.map((trackId, i) => (
                        <DraggableItem key={trackId} id={trackId}>
                            {({ setNodeRef, style, isDragging, listeners, attributes }) => (
                                <PlaylistTrackRow
                                    index={i}
                                    trackId={trackId}
                                    isActive={
                                        isPlaying && isCurrentPlaylist && currentTrackId === trackId
                                    }
                                    canEdit={isLocal}
                                    onRowClick={handleRowClick}
                                    onAddToPlaylist={addToPlaylist}
                                    onRemoveFromPlaylist={removeTrack}
                                    setNodeRef={setNodeRef}
                                    style={style}
                                    listeners={listeners}
                                    attributes={attributes}
                                    isDragging={isDragging}
                                />
                            )}
                        </DraggableItem>
                    ))}
                </Flex>
            </DraggableList>

            <InfiniteScrollFooter
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
            />
        </>
    );
};
