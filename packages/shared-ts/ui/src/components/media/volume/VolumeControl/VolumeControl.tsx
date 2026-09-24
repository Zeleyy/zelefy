import styles from "./VolumeControl.module.scss";
import { Flex } from "../../../primitives/Flex";
import { Button } from "../../../primitives/Button";
import { ProgressBar } from "../../progress";
import { HighVolumeIcon, LowVolumeIcon, MuteIcon } from "../../../../icons";

export interface VolumeControlProps {
    isMuted?: boolean;
    volume?: number;
    onChange?: (volume: number) => void;
    onToggleMute?: () => void;
}

export const VolumeControl = ({
    isMuted = false,
    volume = 100,
    onChange,
    onToggleMute,
}: VolumeControlProps) => {
    const handleVolumeChange = (newVolume: number) => {
        onChange?.(newVolume);
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
                onClick={onToggleMute}
                aria-label={isMuted ? "Unmute volume" : "Mute volume"}
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
