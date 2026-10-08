import styles from "./Cover.module.scss";
import clsx from "clsx";
import { Button, GradientImage } from "../../primitives";
import { PauseIcon, PlayIcon } from "../../../icons";

export type CoverSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface CoverProps {
    src?: string;
    size?: CoverSize;
    alt?: string;
    showPlayOverlay?: boolean;
    isPlaying?: boolean;
    onPlayClick?: () => void;
}

export const Cover = ({
    src,
    size = "md",
    alt = "Track cover",
    showPlayOverlay = false,
    isPlaying = false,
    onPlayClick,
}: CoverProps) => {
    return (
        <GradientImage
            className={clsx(styles.cover, styles[`cover--${size}`])}
            src={src}
            seed={alt}
            aspectRatio="1/1"
            alt={alt}
        >
            {(isPlaying || showPlayOverlay) && (
                <div className={clsx(styles.overlay, { [styles["overlay--visible"]]: isPlaying })}>
                    <Button
                        variant="primary"
                        radius="full"
                        square
                        onClick={onPlayClick}
                        aria-label={isPlaying ? "Pause track" : "Play track"}
                    >
                        {isPlaying ? (
                            <PauseIcon width={24} height={24} />
                        ) : (
                            <PlayIcon width={24} height={24} />
                        )}
                    </Button>
                </div>
            )}
        </GradientImage>
    );
};
