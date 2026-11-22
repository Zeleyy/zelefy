import styles from "./SearchRow.module.scss";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router";
import type { PlayerTrack } from "@zelefy/types";
import { Button, Cover, Flex, Icon } from "@zelefy/ui";
import { TrackWaveform } from "@/features/player";
import { useAddToQueue } from "@/features/queue";
import { useWaveform } from "@/features/waveform";
import { useTrackPlayback } from "./useTrackPlayback";

interface SearchRowProps {
    track: PlayerTrack | undefined;
    title?: string | null;
    href: string;
    isCurrent: boolean;
    onPlay: () => void | Promise<void>;
    onAddToPlaylist: () => void;
    onAddToQueue?: () => void;
    children?: ReactNode;
}

export const SearchRow = ({
    track,
    title,
    href,
    isCurrent,
    onPlay,
    onAddToPlaylist,
    children,
}: SearchRowProps) => {
    const { data: waveform } = useWaveform(track?.waveformSrc);
    const addToQueue = useAddToQueue();
    const { isActive, toggle, seekTo } = useTrackPlayback(isCurrent, onPlay);

    const coverSrc = track?.coverSrc ?? undefined;

    return (
        <Flex
            className={styles.row}
            gap="md"
            style={{ "--cover-url": coverSrc ? `url(${coverSrc})` : "none" } as CSSProperties}
        >
            <Cover src={coverSrc} alt={title ?? ""} size="lg" />

            <Flex direction="column" justify="space-between" gap="sm" className={styles.row__meta}>
                <Flex gap="sm" align="flex-start">
                    <Button radius="full" square disabled={!track} onClick={toggle}>
                        <Icon name={isActive ? "player-pause" : "player-play"} size={26} />
                    </Button>

                    <Flex direction="column">
                        <Link to={href} className={styles.row__title}>
                            {title}
                        </Link>
                        {track?.metadataArtist && (
                            <span className={styles.row__artist}>{track.metadataArtist}</span>
                        )}
                    </Flex>
                </Flex>

                {track && (
                    <TrackWaveform
                        data={waveform}
                        durationMs={track.durationMs}
                        onSeek={(time) => void seekTo(time)}
                        height={60}
                        baseline={0.65}
                        isCurrentTrack={isCurrent}
                    />
                )}

                {children}

                {track && (
                    <Flex gap="2xs">
                        <Button variant="secondary" square onClick={onAddToPlaylist}>
                            <Icon name="player-list-plus" size={20} />
                        </Button>
                        <Button variant="secondary" square onClick={() => addToQueue(track)}>
                            <Icon name="player-list-end" size={20} />
                        </Button>
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
};
