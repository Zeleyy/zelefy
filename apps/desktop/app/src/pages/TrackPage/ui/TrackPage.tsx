import { useParams } from "react-router";
import { PlayerTrackHero, useCurrentTrack, usePlayerStore, useTrack } from "@/features/player";
import { useWaveform } from "@/features/waveform";

export const TrackPage = () => {
    const params = useParams();
    const trackId = Number(params.trackId);

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
            onTogglePlay={() => {
                if (isCurrentTrack) {
                    togglePlay();
                } else {
                    playTrack(trackId);
                }
            }}
            onSeek={(time) => {
                if (isCurrentTrack) {
                    seek(time);
                } else {
                    playTrack(trackId);
                    seek(time);
                }
            }}
        />
    );
};
