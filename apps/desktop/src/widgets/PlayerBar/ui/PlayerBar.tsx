import {
    AudioSettings,
    Button,
    EqualizerIcon,
    HeartIcon,
    HighVolumeIcon,
    LowVolumeIcon,
    MuteIcon,
    PauseIcon,
    PlayIcon,
    QueueIcon,
    RepeatIcon,
    ShuffleIcon,
    SkipNextIcon,
    SkipPrevIcon,
} from "@zelefy/ui";
import styles from "./PlayerBar.module.scss";
import { useState } from "react";
import { useSettingsStore } from "@/shared/lib/hooks";

export const PlayerBar = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    const isMuted = useSettingsStore((state) => state.isMuted);
    const volume = useSettingsStore((state) => state.volume);
    const setIsMuted = useSettingsStore((state) => state.setIsMuted);
    // const setVolume = useSettingsStore().setVolume;

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.mainControls}>
                        <div className={styles.trackInfo}>
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
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.playbackButtons}>
                            <Button variant="ghost" radius="full" square>
                                <ShuffleIcon width={16} height={16} />
                            </Button>

                            <Button variant="ghost" radius="full" square>
                                <SkipPrevIcon width={20} height={20} />
                            </Button>

                            <Button
                                radius="full"
                                size="large"
                                square
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? (
                                    <PlayIcon width={20} height={20} />
                                ) : (
                                    <PauseIcon width={20} height={20} />
                                )}
                            </Button>

                            <Button variant="ghost" radius="full" square>
                                <SkipNextIcon width={20} height={20} />
                            </Button>

                            <Button variant="ghost" radius="full" square>
                                <RepeatIcon width={16} height={16} />
                            </Button>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.volumeControls}>
                            <Button variant="ghost" radius="full" square>
                                <AudioSettings width={16} height={16} />
                            </Button>

                            <Button variant="ghost" radius="full" square>
                                <EqualizerIcon width={16} height={16} />
                            </Button>

                            <Button variant="ghost" radius="full" square>
                                <QueueIcon width={16} height={16} />
                            </Button>

                            <Button
                                variant="ghost"
                                radius="full"
                                square
                                colorScheme={{
                                    color: isMuted ? "var(--danger)" : undefined,
                                    colorHover: isMuted ? "var(--danger)" : undefined,
                                }}
                                onClick={() => setIsMuted(!isMuted)}
                            >
                                {isMuted ? (
                                    <MuteIcon width={16} height={16} />
                                ) : volume < 50 ? (
                                    <LowVolumeIcon width={16} height={16} />
                                ) : (
                                    <HighVolumeIcon width={16} height={16} />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className={styles.progressSection}>
                        <div className={styles.timeInfo}>
                            <p>1:45</p>
                            <span>3:24</span>
                        </div>

                        <span className={styles.progressBar}>
                            <span className={styles.progressBackground}>
                                <span
                                    className={styles.progressFill}
                                    style={{ right: "30%" }}
                                ></span>
                            </span>
                            <span className={styles.thumbWrapper} style={{ right: "30%" }}>
                                <span className={styles.thumb}></span>
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
