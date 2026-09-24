import styles from "./PlayerBar.module.scss";
import { useState } from "react";
import {
    AudioSettings,
    Button,
    EqualizerIcon,
    Flex,
    HeartIcon,
    PauseIcon,
    PlayIcon,
    ProgressBar,
    QueueIcon,
    RepeatIcon,
    ShuffleIcon,
    SkipNextIcon,
    SkipPrevIcon,
    VolumeControl,
} from "@zelefy/ui";
import { usePlayerStore, useSettingsStore } from "@/shared/lib/stores";

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

    const currentTime = usePlayerStore((state) => state.currentTime);
    const duration = usePlayerStore((state) => state.duration);
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
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <Flex direction="column" gap="md">
                    <div className={styles.mainControls}>
                        <Flex align="center" gap="sm" className={styles.shrinkPrevent}>
                            <img
                                src="https://avatars.githubusercontent.com/u/192537945?s=400&u=193d7630edda49abaa85c6014c8018b0f0963ae7&v=4"
                                alt="track cover"
                                width={48}
                                height={48}
                                className={styles.cover}
                            />
                            <div className={styles.meta}>
                                <span className={styles.title}>
                                    A-One - U.N. Owen Was Her? feat. HIKO
                                </span>
                                <span>A-One</span>
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
                            >
                                <ShuffleIcon width={16} height={16} />
                            </Button>

                            <Button variant="ghost" radius="full" square>
                                <SkipPrevIcon width={20} height={20} />
                            </Button>

                            <Button radius="full" size="large" square onClick={togglePlay}>
                                {isPlaying ? (
                                    <PauseIcon width={20} height={20} />
                                ) : (
                                    <PlayIcon width={20} height={20} />
                                )}
                            </Button>

                            <Button variant="ghost" radius="full" square>
                                <SkipNextIcon width={20} height={20} />
                            </Button>

                            <Button
                                variant="ghost"
                                radius="full"
                                square
                                className={styles.optionalControl}
                            >
                                <RepeatIcon width={16} height={16} />
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
                            <span>{formatTime(duration)}</span>
                        </Flex>

                        <ProgressBar
                            time={displayTime}
                            duration={duration}
                            onChange={setDragTime}
                            onChangeEnd={handleSeekCommit}
                        />
                    </div>
                </Flex>
            </div>
        </div>
    );
};
