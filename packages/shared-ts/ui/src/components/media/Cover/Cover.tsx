import styles from "./Cover.module.scss";
import clsx from "clsx";
import { Button, Image } from "../../primitives";
import { PlayIcon } from "../../../icons";

export type CoverSize = "sm" | "md" | "lg" | "xl";

interface CoverProps {
    src?: string;
    size?: CoverSize;
    alt?: string;
    showPlayOverlay?: boolean;
    onPlayClick?: () => void;
}

export const Cover = ({
    src,
    size = "md",
    alt = "Track cover",
    showPlayOverlay = false,
    onPlayClick,
}: CoverProps) => {
    return (
        <Image
            className={clsx(styles.cover, styles[`cover--${size}`])}
            src={src}
            aspectRatio="1/1"
            alt={alt}
        >
            {showPlayOverlay && (
                <div className={styles.overlay}>
                    <Button
                        variant="primary"
                        radius="full"
                        square
                        onClick={onPlayClick}
                        aria-label="Play track"
                    >
                        <PlayIcon width={24} height={24} />
                    </Button>
                </div>
            )}
        </Image>
    );
};
