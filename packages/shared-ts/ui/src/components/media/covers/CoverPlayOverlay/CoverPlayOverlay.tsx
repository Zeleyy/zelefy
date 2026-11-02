import styles from "./CoverPlayOverlay.module.scss";
import clsx from "clsx";
import { Cover, type CoverProps } from "../Cover";
import { Button, Icon } from "../../../primitives";

export interface CoverPlayOverlayProps extends CoverProps {
    isPlaying?: boolean;
    onPlayClick?: () => void;
}

export const CoverPlayOverlay = ({
    className,
    isPlaying = false,
    onPlayClick,
    ...rest
}: CoverPlayOverlayProps) => (
    <Cover className={clsx(styles.cover, className)} {...rest}>
        <div className={clsx(styles.overlay, { [styles["overlay--visible"]]: isPlaying })}>
            <Button
                variant="primary"
                radius="full"
                square
                onClick={onPlayClick}
                aria-label={isPlaying ? "Pause track" : "Play track"}
            >
                <Icon name={isPlaying ? "player-pause" : "player-play"} width={24} height={24} />
            </Button>
        </div>
    </Cover>
);
