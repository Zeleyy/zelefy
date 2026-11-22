import { memo, useCallback } from "react";
import { Flex } from "@zelefy/ui";
import type { TrackId } from "@/entities/track";
import type { PlaylistWithFirstTrackId } from "@/entities/playlist";
import {
    selectCurrentPlaylistId,
    useCurrentTrack,
    usePlayerStore,
    useTrack,
} from "@/features/player";
import { usePlaylistActions } from "@/features/playlist";
import { PlaylistTrackRow } from "@/pages/PlaylistPage/ui/PlaylistTrackRow";
import { SearchRow } from "../SearchRow";

interface PlaylistRowProps {
    playlist: PlaylistWithFirstTrackId;
}

export const PlaylistRow = memo(({ playlist }: PlaylistRowProps) => {
    const currentTrack = useCurrentTrack();
    const isCurrentPlaylist = usePlayerStore(selectCurrentPlaylistId) === playlist.playlistId;
    const { data: firstTrack } = useTrack(playlist.trackId ?? undefined);

    const { play, addToPlaylist } = usePlaylistActions(playlist.playlistId, playlist);

    const trackIds: TrackId[] = playlist.trackId ? [playlist.trackId] : [];
    const isCurrent = Boolean(
        firstTrack && currentTrack?.trackId === firstTrack.trackId && isCurrentPlaylist,
    );

    const onPlay = useCallback(() => play(), [play]);

    return (
        <SearchRow
            track={firstTrack}
            title={playlist.title}
            href={`/playlist/${playlist.playlistId}`}
            isCurrent={isCurrent}
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
                            onRowClick={(i) => void play(i)}
                            onAddToPlaylist={addToPlaylist}
                            onRemoveFromPlaylist={() => {}}
                        />
                    ))}
                </Flex>
            )}
        </SearchRow>
    );
});
