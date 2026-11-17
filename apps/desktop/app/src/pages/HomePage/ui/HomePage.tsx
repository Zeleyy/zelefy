import { useState } from "react";
import { useWaveform } from "@/features/waveform";
import { PlayerTrackHero, useCurrentTrack, usePlayerStore } from "@/features/player";

export const HomePage = () => {
    const isPlaying = usePlayerStore((state) => state.isPlaying);
    const togglePlay = usePlayerStore((state) => state.togglePlay);

    const track = useCurrentTrack();

    const { data } = useWaveform(track?.waveformSrc);

    const [lastTrack, setLastTrack] = useState(track);
    if (track && track !== lastTrack) setLastTrack(track);
    const displayTrack = track ?? lastTrack;

    return (
        <>
            <PlayerTrackHero
                track={displayTrack ?? undefined}
                isPlaying={isPlaying}
                waveformData={data}
                onTogglePlay={togglePlay}
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
