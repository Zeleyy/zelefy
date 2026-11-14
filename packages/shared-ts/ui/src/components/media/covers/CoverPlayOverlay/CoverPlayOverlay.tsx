import styles from "./CoverPlayOverlay.module.scss";
import clsx from "clsx";
import { Button, Icon } from "../../../primitives";
import { Cover, type CoverProps } from "../Cover";

export interface CoverPlayOverlayProps extends CoverProps {
    isPlaying?: boolean;
    onPlayClick?: () => void;
    onCoverClick?: () => void;
}

export const CoverPlayOverlay = ({
    className,
    isPlaying = false,
    onPlayClick,
    onCoverClick,
    ...rest
}: CoverPlayOverlayProps) => (
    <Cover className={clsx(styles.cover, className)} {...rest}>
        <div
            className={clsx(styles.overlay, { [styles["overlay--visible"]]: isPlaying })}
            onClick={onCoverClick}
        >
            <Button
                variant="primary"
                radius="full"
                square
                onClick={(e) => {
                    e.stopPropagation();
                    onPlayClick?.();
                }}
                aria-label={isPlaying ? "Pause track" : "Play track"}
            >
                <Icon name={isPlaying ? "player-pause" : "player-play"} width={24} height={24} />
            </Button>
        </div>
    </Cover>
);
