import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { EmptyState, Flex, SpinnerLoader } from "@zelefy/ui";
import { queryClient } from "@/shared/api";
import { localPlaylistAllTrackIdsOptions } from "@/entities/playlist";
import { useLocalPlaylistTrackIds } from "@/features/playlist";
import { useWaveform } from "@/features/waveform";
import {
    PlayerTrackHero,
    selectCurrentPlaylistId,
    selectCurrentTrackId,
    usePlayerStore,
    useTrack,
} from "@/features/player";
import { PlaylistTrackRow } from "./PlaylistTrackRow";
import { openModal } from "@/shared/lib/stores/useModalStore";
import type { TrackId } from "@/entities/track";

export const PlaylistPage = () => {
    const { t } = useTranslation();
    const { playlistId: rawPlaylistId } = useParams();
    const playlistId = Number(rawPlaylistId);
    const navigate = useNavigate();

    const playTrack = usePlayerStore((s) => s.playTrack);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const currentPlaylistId = usePlayerStore(selectCurrentPlaylistId);
    const currentTrackId = usePlayerStore(selectCurrentTrackId);
    const isCurrentPlaylist = currentPlaylistId === playlistId;

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
        useLocalPlaylistTrackIds(playlistId);

    const tracks = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

    const heroTrackId = isCurrentPlaylist ? currentTrackId : tracks[0]?.trackId;
    const { data: track } = useTrack(heroTrackId);
    const { data: waveform } = useWaveform(track?.waveformSrc);

    const handlePlay = useCallback(
        async (trackIndex?: number) => {
            const allTrackIds = await queryClient.query(
                localPlaylistAllTrackIdsOptions(playlistId),
            );
            if (!allTrackIds?.length) return;
            console.log(allTrackIds[trackIndex ?? 0], allTrackIds, playlistId);
            playTrack(allTrackIds[trackIndex ?? 0], allTrackIds, playlistId);
        },
        [playlistId, playTrack],
    );

    const handleRowClick = useCallback(
        (index: number) => {
            const item = tracks[index];
            if (!item) return;
            const isCurrent = isCurrentPlaylist && currentTrackId === item.trackId;
            if (isCurrent) {
                togglePlay();
                return;
            }
            handlePlay(index);
        },
        [tracks, isCurrentPlaylist, currentTrackId, togglePlay, handlePlay],
    );

    const handleTitleClick = useCallback(
        (trackId: TrackId) => navigate(`/track/${trackId}`),
        [navigate],
    );

    const handleAddToPlaylist = useCallback(
        (trackId: TrackId) => openModal("addToPlaylist", { trackId }),
        [],
    );

    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { rootMargin: "200px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) return <SpinnerLoader isLoading />;
    if (isError) return <EmptyState title={t("playlist.list.error")} description={String(error)} />;
    if (tracks.length === 0) return <EmptyState title={t("playlist.list.empty")} />;

    return (
        <>
            <PlayerTrackHero
                track={track}
                isCurrentTrack={isCurrentPlaylist}
                waveformData={waveform}
                onTogglePlay={() => {
                    console.log(isCurrentPlaylist);
                    if (isCurrentPlaylist) {
                        togglePlay();
                        return;
                    }
                    handlePlay();
                }}
            />

            <Flex direction="column" gap="xs">
                {tracks.map((item, i) => {
                    const isCurrent = isCurrentPlaylist && currentTrackId === item.trackId;
                    const isActive = isPlaying && isCurrent;

                    return (
                        <PlaylistTrackRow
                            key={`${item.playlistId}-${item.trackId}`}
                            index={i}
                            trackId={item.trackId}
                            isActive={isActive}
                            onRowClick={handleRowClick}
                            onTitleClick={handleTitleClick}
                            onAddToPlaylist={handleAddToPlaylist}
                        />
                    );
                })}
            </Flex>

            <div ref={sentinelRef} />
        </>
    );
};
