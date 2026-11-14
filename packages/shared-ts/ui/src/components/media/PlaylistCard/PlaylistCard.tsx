import styles from "./PlaylistCard.module.scss";
import { Flex } from "../../primitives";
import { CoverPlayOverlay } from "../covers";

interface PlaylistCardProps {
    title: string;
    metadataArtist?: string | null;
    coverSrc?: string;
    isPlaying?: boolean;
    onPlayClick?: () => void;
    onOpen?: () => void;
}

export const PlaylistCard = ({
    title,
    metadataArtist,
    coverSrc,
    isPlaying = false,
    onPlayClick,
    onOpen,
}: PlaylistCardProps) => {
    return (
        <Flex direction="column" gap="2xs" className={styles.card}>
            <CoverPlayOverlay
                src={coverSrc}
                alt={title}
                isPlaying={isPlaying}
                onPlayClick={onPlayClick}
                onCoverClick={onOpen}
                size="lg"
            />

            <Flex direction="column" className={styles.meta}>
                <span className={styles.title} onClick={onOpen} role="link" tabIndex={0}>
                    {title}
                </span>

                {metadataArtist && <p className={styles.artist}>{metadataArtist}</p>}
            </Flex>
        </Flex>
    );
};
