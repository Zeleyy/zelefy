import { useTranslation } from "react-i18next";
import { Button, Flex, WaveformBar } from "@zelefy/ui";
import { useWaveform } from "@/features/waveform";
import { usePlayerStore } from "@/shared/lib/stores";
import { useState } from "react";

export const HomePage = () => {
    const { t } = useTranslation();
    const resetPlayer = usePlayerStore((state) => state.resetPlayer);
    const playTrack = usePlayerStore((state) => state.playTrack);
    const { data } = useWaveform(
        "D:\\zelefy-data\\library\\waveform\\d4\\d420448cc8954db7a9514ddba3ae2f31.bin",
    );

    const track = usePlayerStore((state) => state.currentTrack);
    const duration = track?.durationSeconds ?? 1;

    const [lastTrack, setLastTrack] = useState(track);
    if (track && track !== lastTrack) setLastTrack(track);

    const currentTime = usePlayerStore((state) => state.currentTime);
    const seek = usePlayerStore((state) => state.seek);

    const [dragTime, setDragTime] = useState<number | null>(null);

    const displayTime = dragTime ?? currentTime;

    const handleSeekCommit = (newTime: number) => {
        if (seek) {
            seek(newTime);
        }
        setDragTime(null);
    };

    return (
        <>
            <h1>{t("home.title")}</h1>

            <Button variant="primary" onClick={resetPlayer}>
                Hide player
            </Button>
            <Button
                variant="primary"
                onClick={() =>
                    playTrack({
                        trackId: "",
                        userId: "",
                        permalink: "string",

                        metadataArtist: null,
                        title: "A-One - U.N. Owen Was Her? feat. HIKO",
                        audioUrl: "",
                        durationSeconds: 204,
                        coverUrl: null,
                        waveformUrl: "",

                        genre: null,
                        description: null,
                        bpm: null,
                        keySignature: null,
                        createdAt: "",

                        playsCount: 0,
                        likesCount: 0,
                        repostsCount: 0,
                        commentsCount: 0,
                    })
                }
            >
                Show player
            </Button>

            <Flex align="center" justify="center">
                {data ? (
                    <WaveformBar
                        data={data}
                        time={displayTime}
                        duration={duration}
                        onChange={setDragTime}
                        onChangeEnd={handleSeekCommit}
                    />
                ) : null}
            </Flex>
        </>
    );
};
