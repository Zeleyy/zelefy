import { useState } from "react";
import { TrackHero } from "@zelefy/ui";
import { useWaveform } from "@/features/waveform";
import { usePlayerStore } from "@/shared/lib/stores";

export const HomePage = () => {
    const isPlaying = usePlayerStore((state) => state.isPlaying);
    const togglePlay = usePlayerStore((state) => state.togglePlay);

    const track = usePlayerStore((state) => state.currentTrack);

    const { data } = useWaveform(track?.waveformSrc);

    const [lastTrack, setLastTrack] = useState(track);
    if (track && track !== lastTrack) setLastTrack(track);
    const displayTrack = track ?? lastTrack;

    const currentTime = usePlayerStore((state) => state.currentTime);
    const seek = usePlayerStore((state) => state.seek);

    return (
        <>
            <TrackHero
                track={displayTrack ?? undefined}
                isPlaying={isPlaying}
                currentTime={currentTime}
                waveformData={data}
                onTogglePlay={togglePlay}
                onSeek={seek}
                onLikeClick={() => {
                    /* Логика лайка */
                }}
                onSaveClick={() => {
                    /* Логика сохранения */
                }}
            />
        </>
    );
};
