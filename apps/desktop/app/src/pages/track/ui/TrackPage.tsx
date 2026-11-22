import { useLoaderData } from "react-router";
import type { TrackId } from "@/entities/track";
import { PlayerTrackHero, useCurrentTrack, usePlayerStore, useTrack } from "@/features/player";
import { useWaveform } from "@/features/waveform";
import { useModalStore } from "@/shared/lib/stores";
import { useAddToQueue } from "@/features/queue";

export const TrackPage = () => {
    const { trackId } = useLoaderData<{ trackId: TrackId }>();

    const openModal = useModalStore((s) => s.openModal);
    const addToQueue = useAddToQueue();

    const { data: track } = useTrack(trackId);
    const { data: waveform } = useWaveform(track?.waveformSrc);
    const currentTrack = useCurrentTrack();

    const seek = usePlayerStore((s) => s.seek);
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const playTrack = usePlayerStore((s) => s.playTrack);

    const isCurrentTrack = currentTrack?.trackId === trackId;

    return (
        <PlayerTrackHero
            track={track}
            isCurrentTrack={isCurrentTrack}
            waveformData={waveform}
            onTogglePlay={() => (isCurrentTrack ? togglePlay() : playTrack(trackId))}
            onSeek={(time) => {
                if (isCurrentTrack) {
                    seek(time);
                } else {
                    playTrack(trackId);
                    seek(time);
                }
            }}
            onAddToPlaylistClick={() => {
                if (!track?.trackId) return;
                openModal("addToPlaylist", { trackId: track.trackId });
            }}
            onAddToQueueClick={() => {
                if (!track) return;
                addToQueue(track);
            }}
        />
    );
};
