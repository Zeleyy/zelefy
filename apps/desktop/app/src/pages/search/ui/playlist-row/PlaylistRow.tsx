import { memo, useCallback } from "react";
import type { TrackId } from "@zelefy/types";
import { Flex } from "@zelefy/ui";
import { toSrc } from "@/shared/lib/utils";
import type { PlaylistWithFirstTrackIds } from "@/entities/playlist";
import {
    selectCurrentPlaylistId,
    useCurrentTrack,
    usePlayerStore,
    useTrack,
} from "@/features/player";
import { usePlaylistActions } from "@/features/playlist";
import { PlaylistTrackRow } from "@/widgets/playlist-tracks";
import { SearchRow } from "../search-row";

interface PlaylistRowProps {
    playlist: PlaylistWithFirstTrackIds;
}

export const PlaylistRow = memo(({ playlist }: PlaylistRowProps) => {
    const currentTrack = useCurrentTrack();
    const isCurrentPlaylist = usePlayerStore(selectCurrentPlaylistId) === playlist.playlistId;
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const { data: firstTrack } = useTrack(playlist.trackIds[0] ?? undefined);

    const { play, addToPlaylist } = usePlaylistActions(playlist.playlistId, playlist);

    const trackIds: TrackId[] = playlist.trackIds;

    const isPlayingFromThisPlaylist = Boolean(
        isCurrentPlaylist && currentTrack && trackIds.includes(currentTrack.trackId),
    );

    const activeTrack = isPlayingFromThisPlaylist ? currentTrack : firstTrack;

    const onPlay = useCallback(() => play(), [play]);

    const handleRowClick = useCallback(
        (index: number) => {
            const trackId = trackIds[index];
            if (trackId === undefined) return;
            if (isCurrentPlaylist && currentTrack?.trackId === trackId) togglePlay();
            else void play(index);
        },
        [trackIds, isCurrentPlaylist, currentTrack, togglePlay, play],
    );

    return (
        <SearchRow
            track={activeTrack}
            coverSrc={toSrc(playlist.coverPath) ?? firstTrack?.coverSrc}
            title={playlist.title}
            href={`/playlist/${playlist.playlistId}`}
            isCurrent={isPlayingFromThisPlaylist}
            onPlay={onPlay}
            onAddToPlaylist={() => firstTrack && addToPlaylist(firstTrack.trackId)}
        >
            {trackIds.length > 0 && (
                <Flex direction="column" gap="2xs">
                    {trackIds.map((id, index) => (
                        <PlaylistTrackRow
                            key={id}
                            index={index}
                            trackId={id}
                            isActive={isCurrentPlaylist && currentTrack?.trackId === id}
                            onRowClick={handleRowClick}
                            onAddToPlaylist={addToPlaylist}
                            onRemoveFromPlaylist={() => {}}
                        />
                    ))}
                </Flex>
            )}
        </SearchRow>
    );
});
