import styles from "./TrackHero.module.scss";
import { Cover, WaveformBar } from "../../media";
import { Button, Flex, Icon } from "../../primitives";
import type { PublicTrack } from "@zelefy/types";

export interface TrackHeroProps {
    track?: PublicTrack | null;
    isPlaying?: boolean;
    currentTime?: number;
    waveformData?: Uint8Array;
    onTogglePlay?: () => void;
    onTimeChange?: (time: number) => void;
    onSeekCommit?: (time: number) => void;
    onLikeClick?: () => void;
    onSaveClick?: () => void;
    className?: string;
}

export const TrackHero = ({
    track,
    isPlaying = false,
    currentTime = 0,
    waveformData,
    onTogglePlay,
    onTimeChange,
    onSeekCommit,
    onLikeClick,
    onSaveClick,
    className,
}: TrackHeroProps) => {
    const duration = track?.durationSeconds ?? 1;

    return (
        <Flex
            as="section"
            align="stretch"
            gap="xl"
            className={`${styles.track} ${className ?? ""}`}
        >
            <Flex
                direction="column"
                gap="md"
                justify="space-between"
                fullWidth
                className={styles.track__body}
            >
                <Flex gap="xl" align="flex-start" className={styles.track__header}>
                    <Button
                        variant="primary"
                        size="large"
                        radius="full"
                        square
                        onClick={onTogglePlay}
                        className={styles.track__play}
                    >
                        <Icon
                            name={isPlaying ? "player-pause" : "player-play"}
                            width={38}
                            height={38}
                        />
                    </Button>

                    <Flex direction="column" className={styles.track__headerContainer}>
                        <h2 className={styles.track__title}>
                            {track?.title ?? "No track selected"}
                        </h2>
                        <p>{track?.metadataArtist ?? "Unknown Artist"}</p>
                    </Flex>
                </Flex>

                {waveformData && waveformData.length > 0 ? (
                    <WaveformBar
                        data={waveformData}
                        time={currentTime}
                        duration={duration}
                        onChange={onTimeChange}
                        onChangeEnd={onSeekCommit}
                        className={styles.track__waveform}
                    />
                ) : null}

                <Flex gap="xs">
                    <Button
                        variant="outline"
                        radius="full"
                        className={styles.track__likeButton}
                        onClick={onLikeClick}
                    >
                        <Icon name="player-heart" width={20} height={20} />
                        <span>{track?.likesCount ?? 0}</span>
                    </Button>

                    <Button variant="outline" radius="full" square onClick={onSaveClick}>
                        <Icon name="action-save" size={20} />
                    </Button>
                </Flex>
            </Flex>

            <Cover
                src={track?.coverUrl ?? undefined}
                alt={track?.title ?? "No track selected"}
                size="xl"
                className={styles.track__cover}
            />
        </Flex>
    );
};
