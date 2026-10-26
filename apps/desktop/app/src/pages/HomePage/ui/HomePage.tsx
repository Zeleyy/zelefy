import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, TrackHero } from "@zelefy/ui";
import { useWaveform } from "@/features/waveform";
import { usePlayerStore } from "@/shared/lib/stores";

export const HomePage = () => {
    const { t } = useTranslation();
    const resetPlayer = usePlayerStore((state) => state.resetPlayer);
    const playTrack = usePlayerStore((state) => state.playTrack);

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
            <h1>{t("home.title")}</h1>

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

            <Button variant="primary" onClick={resetPlayer}>
                Hide player
            </Button>
            <Button
                variant="primary"
                onClick={() =>
                    playTrack({
                        trackId: "",
                        // permalink: "string",

                        metadataArtist: "A-One",
                        title: "A-One - U.N. Owen Was Her? feat. HIKO",
                        audioSrc: "",
                        durationSeconds: 204,
                        coverSrc: null,
                        waveformSrc: "",

                        genre: null,
                        // description: null,
                        // bpm: null,
                        // keySignature: null,
                        // createdAt: "",

                        // playsCount: 0,
                        likesCount: 0,
                        // repostsCount: 0,
                        // commentsCount: 0,
                    })
                }
            >
                Show player
            </Button>
        </>
    );
};
