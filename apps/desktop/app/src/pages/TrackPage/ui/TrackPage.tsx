import { useParams } from "react-router";
import { TrackHero } from "@zelefy/ui";
import { useCurrentTrack, usePlayerStore, useTrack } from "@/features/player";
import { useWaveform } from "@/features/waveform";

export const TrackPage = () => {
    const params = useParams();
    const trackId = Number(params.trackId);
    const { data: track } = useTrack(trackId);
    const { data: waveform } = useWaveform(track?.waveformSrc);
    const currentTrack = useCurrentTrack();

    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const currentTime = usePlayerStore((s) => s.currentTime);
    const seek = usePlayerStore((s) => s.seek);
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const playTrack = usePlayerStore((s) => s.playTrack);

    const isCurrentTrack = track === currentTrack;

    return (
        <>
            <TrackHero
                key={track?.trackId}
                track={track}
                isPlaying={isCurrentTrack && isPlaying}
                currentTime={isCurrentTrack ? currentTime : 0}
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
        </>
    );
};
