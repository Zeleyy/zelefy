import { useState } from "react";
import { useWaveform } from "@/features/waveform";
import { PlayerTrackHero, useCurrentTrack, usePlayerStore } from "@/features/player";
import { useModalStore } from "@/shared/lib/stores";
import { useAddToQueue } from "@/features/queue";

export const HomePage = () => {
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const addToQueue = useAddToQueue();
    const openModal = useModalStore((s) => s.openModal);

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
                onAddToPlaylistClick={() => {
                    if (displayTrack?.trackId) {
                        openModal("addToPlaylist", { trackId: displayTrack.trackId });
                    }
                }}
                onAddToQueueClick={() => {
                    if (displayTrack) {
                        addToQueue(displayTrack);
                    }
                }}
            />
        </>
    );
};
