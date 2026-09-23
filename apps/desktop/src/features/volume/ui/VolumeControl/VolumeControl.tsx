import styles from "./VolumeControl.module.scss";
import { Button, Flex, HighVolumeIcon, LowVolumeIcon, MuteIcon, ProgressBar } from "@zelefy/ui";
import { useSettingsStore } from "@/shared/lib/stores";

export const VolumeControl = () => {
    const isMuted = useSettingsStore((state) => state.isMuted);
    const volume = useSettingsStore((state) => state.volume);
    const setVolume = useSettingsStore((state) => state.setVolume);
    const setIsMuted = useSettingsStore((state) => state.setIsMuted);

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        if (isMuted && newVolume > 0) {
            setIsMuted(false);
        }
    };

    return (
        <div className={styles.volumeWrapper}>
            <Flex align="center" justify="center" className={styles.popover}>
                <ProgressBar
                    time={isMuted ? 0 : volume}
                    duration={100}
                    step={1}
                    onChange={handleVolumeChange}
                    orientation="vertical"
                />
            </Flex>

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
                {isMuted || volume === 0 ? (
                    <MuteIcon width={16} height={16} />
                ) : volume < 50 ? (
                    <LowVolumeIcon width={16} height={16} />
                ) : (
                    <HighVolumeIcon width={16} height={16} />
                )}
            </Button>
        </div>
    );
};
