import { memo, useCallback } from "react";
import type { TrackId } from "@/entities/track";
import { usePlayerStore, useTrack } from "@/features/player";
import { SearchRow } from "../SearchRow";

interface TrackRowProps {
    trackId: TrackId;
    isCurrent?: boolean;
    onAddToPlaylist: (trackId: TrackId) => void;
}

export const TrackRow = memo(({ trackId, isCurrent = false, onAddToPlaylist }: TrackRowProps) => {
    const { data: track } = useTrack(trackId);
    const playTrack = usePlayerStore((s) => s.playTrack);
    const onPlay = useCallback(() => playTrack(trackId), [playTrack, trackId]);

    if (!track) return null;

    return (
        <SearchRow
            track={track}
            title={track.title}
            href={`/track/${trackId}`}
            isCurrent={isCurrent}
            onPlay={onPlay}
            onAddToPlaylist={() => onAddToPlaylist(trackId)}
        />
    );
});
