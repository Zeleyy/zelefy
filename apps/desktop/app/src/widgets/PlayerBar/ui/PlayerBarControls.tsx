import styles from "./PlayerBar.module.scss";
import { Button, Flex, Icon } from "@zelefy/ui";
import { usePlayerStore } from "@/features/player";

export const PlayerBarControls = () => {
    const isPlaying = usePlayerStore((state) => state.isPlaying);
    const togglePlay = usePlayerStore((state) => state.togglePlay);
    const nextTrack = usePlayerStore((state) => state.nextTrack);
    const previousTrack = usePlayerStore((state) => state.previousTrack);

    const isShuffle = usePlayerStore((state) => state.isShuffle);
    const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
    const repeatMode = usePlayerStore((state) => state.repeatMode);
    const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);

    return (
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

            <Button variant="ghost" radius="full" square onClick={previousTrack}>
                <Icon name="player-skip-prev" width={20} height={20} />
            </Button>

            <Button radius="full" size="large" square onClick={togglePlay}>
                <Icon name={isPlaying ? "player-pause" : "player-play"} width={20} height={20} />
            </Button>

            <Button variant="ghost" radius="full" square onClick={nextTrack}>
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
                    name={repeatMode === "track" ? "player-repeat-one" : "player-repeat"}
                    width={16}
                    height={16}
                />
            </Button>
        </Flex>
    );
};
