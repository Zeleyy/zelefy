import styles from "./HomePage.module.scss";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Cover, Flex, Icon, WaveformBar } from "@zelefy/ui";
import { useWaveform } from "@/features/waveform";
import { usePlayerStore } from "@/shared/lib/stores";

export const HomePage = () => {
    const { t } = useTranslation();
    const resetPlayer = usePlayerStore((state) => state.resetPlayer);
    const playTrack = usePlayerStore((state) => state.playTrack);

    const isPlaying = usePlayerStore((state) => state.isPlaying);
    const togglePlay = usePlayerStore((state) => state.togglePlay);

    const { data } = useWaveform(
        "D:\\zelefy-data\\library\\waveform\\d4\\d420448cc8954db7a9514ddba3ae2f31.bin",
    );

    const track = usePlayerStore((state) => state.currentTrack);
    const duration = track?.durationSeconds ?? 1;

    const [lastTrack, setLastTrack] = useState(track);
    if (track && track !== lastTrack) setLastTrack(track);
    const displayTrack = track ?? lastTrack;

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

            <Flex as="section" align="stretch" gap="xl" className={styles.track}>
                <Flex
                    direction="column"
                    gap="md"
                    justify="space-between"
                    fullWidth
                    className={styles.track__body}
                >
                    <Flex gap="xl" align="flex-start" className={styles.track__header}>
                        <Button
                            variant="primary"
                            size="large"
                            radius="full"
                            square
                            onClick={togglePlay}
                            className={styles.track__play}
                        >
                            <Icon
                                name={isPlaying ? "player-pause" : "player-play"}
                                width={38}
                                height={38}
                            />
                        </Button>

                        <Flex direction="column" className={styles.track__headerContainer}>
                            <h2 className={styles.track__title}>{displayTrack?.title}</h2>
                            <p>{displayTrack?.metadataArtist}</p>
                        </Flex>
                    </Flex>

                    {data ? (
                        <WaveformBar
                            data={data}
                            time={displayTime}
                            duration={duration}
                            onChange={setDragTime}
                            onChangeEnd={handleSeekCommit}
                            className={styles.track__waveform}
                        />
                    ) : null}

                    <Flex gap="xs">
                        <Button
                            variant="outline"
                            radius="full"
                            className={styles.track__likeButton}
                        >
                            <Icon name="player-heart" width={20} height={20} />
                            <span>{displayTrack?.likesCount}</span>
                        </Button>

                        <Button variant="outline" radius="full" square>
                            <Icon name="action-save" size={20} />
                        </Button>
                    </Flex>
                </Flex>

                <Cover
                    src={displayTrack?.coverUrl ?? undefined}
                    alt={displayTrack?.title ?? "No track selected"}
                    size="xl"
                    className={styles.track__cover}
                    // showPlayOverlay
                    // isPlaying={isPlaying}
                    // onPlayClick={togglePlay}
                />
            </Flex>

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

                        metadataArtist: "A-One",
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
        </>
    );
};
