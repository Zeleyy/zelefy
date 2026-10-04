import styles from "./PlayerBar.module.scss";
import { useState } from "react";
import {
    AudioSettings,
    Button,
    Cover,
    EqualizerIcon,
    Flex,
    HeartIcon,
    PauseIcon,
    PlayIcon,
    ProgressBar,
    QueueIcon,
    RepeatIcon,
    RepeatOneIcon,
    ShuffleIcon,
    SkipNextIcon,
    SkipPrevIcon,
    VolumeControl,
} from "@zelefy/ui";
import { usePlayerStore, useSettingsStore } from "@/shared/lib/stores";
import clsx from "clsx";

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const PlayerBar = () => {
    const isMuted = useSettingsStore((state) => state.isMuted);
    const volume = useSettingsStore((state) => state.volume);
    const setVolume = useSettingsStore((state) => state.setVolume);
    const setIsMuted = useSettingsStore((state) => state.setIsMuted);

    const isPlaying = usePlayerStore((state) => state.isPlaying);
    const togglePlay = usePlayerStore((state) => state.togglePlay);
    const nextTrack = usePlayerStore((state) => state.nextTrack);
    const previousTrack = usePlayerStore((state) => state.previousTrack);

    const isShuffle = usePlayerStore((state) => state.isShuffle);
    const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
    const repeatMode = usePlayerStore((state) => state.repeatMode);
    const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);

    const track = usePlayerStore((state) => state.currentTrack);

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
        <div
            className={clsx(styles.wrapper, { [styles["wrapper--show"]]: track })}
            aria-hidden={!track}
        >
            <div className={styles.clip}>
                <Flex align="center" justify="center" className={styles.inner}>
                    <div className={styles.container}>
                        <Flex direction="column" gap="md">
                            <div className={styles.mainControls}>
                                <Flex align="center" gap="sm" className={styles.shrinkPrevent}>
                                    <Cover
                                        src={displayTrack?.coverUrl ?? undefined}
                                        alt={displayTrack?.title ?? "No track selected"}
                                        size="sm"
                                    />
                                    <div className={styles.meta}>
                                        <span className={styles.title}>
                                            {displayTrack?.title ?? "No track selected"}
                                        </span>
                                        <span>Artist</span>
                                    </div>
                                    <Button variant="ghost" radius="full" square>
                                        <HeartIcon width={16} height={16} />
                                    </Button>
                                </Flex>

                                <div className={styles.divider} />

                                <Flex align="center" gap="3xs" className={styles.shrinkPrevent}>
                                    <Button
                                        variant="ghost"
                                        radius="full"
                                        square
                                        className={styles.optionalControl}
                                        onClick={toggleShuffle}
                                        colorScheme={
                                            isShuffle
                                                ? {
                                                      color: "var(--primary)",
                                                      colorHover: "var(--primary)",
                                                  }
                                                : undefined
                                        }
                                    >
                                        <ShuffleIcon width={16} height={16} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        radius="full"
                                        square
                                        onClick={previousTrack}
                                    >
                                        <SkipPrevIcon width={20} height={20} />
                                    </Button>

                                    <Button radius="full" size="large" square onClick={togglePlay}>
                                        {isPlaying ? (
                                            <PauseIcon width={20} height={20} />
                                        ) : (
                                            <PlayIcon width={20} height={20} />
                                        )}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        radius="full"
                                        square
                                        onClick={nextTrack}
                                    >
                                        <SkipNextIcon width={20} height={20} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        radius="full"
                                        square
                                        className={styles.optionalControl}
                                        onClick={toggleRepeat}
                                        colorScheme={
                                            repeatMode !== "off"
                                                ? {
                                                      color: "var(--primary)",
                                                      colorHover: "var(--primary)",
                                                  }
                                                : undefined
                                        }
                                    >
                                        {repeatMode === "track" ? (
                                            <RepeatOneIcon width={16} height={16} />
                                        ) : (
                                            <RepeatIcon width={16} height={16} />
                                        )}
                                    </Button>
                                </Flex>

                                <div className={styles.divider}></div>

                                <Flex align="center" gap="3xs" className={styles.shrinkPrevent}>
                                    <Button
                                        variant="ghost"
                                        radius="full"
                                        square
                                        className={styles.secondaryControl}
                                    >
                                        <AudioSettings width={16} height={16} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        radius="full"
                                        square
                                        className={styles.tertiaryControl}
                                    >
                                        <EqualizerIcon width={16} height={16} />
                                    </Button>

                                    <Button variant="ghost" radius="full" square>
                                        <QueueIcon width={16} height={16} />
                                    </Button>

                                    <VolumeControl
                                        volume={volume}
                                        isMuted={isMuted}
                                        onChange={(newVolume) => {
                                            setVolume(newVolume);
                                            if (isMuted && newVolume > 0) {
                                                setIsMuted(false);
                                            }
                                        }}
                                        onToggleMute={() => setIsMuted(!isMuted)}
                                    />
                                </Flex>
                            </div>

                            <div className={styles.progressSection}>
                                <Flex justify="space-between">
                                    <p>{formatTime(displayTime)}</p>
                                    <span>{formatTime(displayTrack?.durationSeconds ?? 0)}</span>
                                </Flex>

                                <ProgressBar
                                    time={displayTime}
                                    duration={displayTrack?.durationSeconds ?? 0}
                                    onChange={setDragTime}
                                    onChangeEnd={handleSeekCommit}
                                />
                            </div>
                        </Flex>
                    </div>
                </Flex>
            </div>
        </div>
    );
};
