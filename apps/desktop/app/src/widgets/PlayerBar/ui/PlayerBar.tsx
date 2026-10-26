import styles from "./PlayerBar.module.scss";
import { useState } from "react";
import {
    Button,
    Cover,
    Flex,
    formatTime,
    Icon,
    ProgressBar,
    useSeekProgress,
    VolumeControl,
} from "@zelefy/ui";
import { usePlayerStore, useSettingsStore } from "@/shared/lib/stores";
import clsx from "clsx";

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

    const { displayTime, handleTimeChange, handleSeekCommit } = useSeekProgress(
        currentTime,
        track?.durationSeconds,
        seek,
    );

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
                                        src={displayTrack?.coverSrc ?? undefined}
                                        alt={displayTrack?.title ?? "No track selected"}
                                        size="sm"
                                    />
                                    <div className={styles.meta}>
                                        <span className={styles.title}>
                                            {displayTrack?.title ?? "No track selected"}
                                        </span>
                                        <span>{displayTrack?.metadataArtist}</span>
                                    </div>
                                    <Button variant="ghost" radius="full" square>
                                        <Icon name="player-heart" width={16} height={16} />
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
                                        <Icon name="player-shuffle" width={16} height={16} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        radius="full"
                                        square
                                        onClick={previousTrack}
                                    >
                                        <Icon name="player-skip-prev" width={20} height={20} />
                                    </Button>

                                    <Button radius="full" size="large" square onClick={togglePlay}>
                                        <Icon
                                            name={isPlaying ? "player-pause" : "player-play"}
                                            width={20}
                                            height={20}
                                        />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        radius="full"
                                        square
                                        onClick={nextTrack}
                                    >
                                        <Icon name="player-skip-next" width={20} height={20} />
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
                                        <Icon
                                            name={
                                                repeatMode === "track"
                                                    ? "player-repeat-one"
                                                    : "player-repeat"
                                            }
                                            width={16}
                                            height={16}
                                        />
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
                                        <Icon name="player-audio-settings" width={16} height={16} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        radius="full"
                                        square
                                        className={styles.tertiaryControl}
                                    >
                                        <Icon name="player-equalizer" width={16} height={16} />
                                    </Button>

                                    <Button variant="ghost" radius="full" square>
                                        <Icon name="player-queue" width={16} height={16} />
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
                                    onChange={handleTimeChange}
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
