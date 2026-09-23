import styles from "./PlayerBar.module.scss";
import {
    AudioSettings,
    Button,
    EqualizerIcon,
    Flex,
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
import { usePlayerStore, useSettingsStore } from "@/shared/lib/stores";

export const PlayerBar = () => {
    const isPlaying = usePlayerStore((state) => state.isPlaying);
    const togglePlay = usePlayerStore((state) => state.togglePlay);
    // const currentTime = usePlayerStore((state) => state.currentTime);
    // const duration = usePlayerStore((state) => state.duration);

    const isMuted = useSettingsStore((state) => state.isMuted);
    const volume = useSettingsStore((state) => state.volume);
    const setIsMuted = useSettingsStore((state) => state.setIsMuted);
    // const setVolume = useSettingsStore().setVolume;

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
                                    <PlayIcon width={20} height={20} />
                                ) : (
                                    <PauseIcon width={20} height={20} />
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
                        </Flex>
                    </div>

                    <div className={styles.progressSection}>
                        <Flex justify="space-between">
                            <p>1:45</p>
                            <span>3:24</span>
                        </Flex>

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
                </Flex>
            </div>
        </div>
    );
};
