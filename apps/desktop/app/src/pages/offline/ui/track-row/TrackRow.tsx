import styles from "./TrackRow.module.scss";
import { memo } from "react";
import clsx from "clsx";
import { Button, Cover, Flex, formatBytes, formatTime, Icon } from "@zelefy/ui";
import type { LocalTrackIdResponse, TrackId } from "@/entities/track";
import { selectCurrentTrackId, usePlayerStore, useTrack } from "@/features/player";

interface TrackRowProps {
    index: number;
    localTrack: LocalTrackIdResponse;
    onPlay: (trackId: TrackId) => void;
    onEdit: (trackId: TrackId) => void;
    onDelete: (trackId: TrackId) => void;
    onAddToPlaylist: (trackId: TrackId) => void;
}

export const TrackRow = memo(
    ({ index, localTrack, onPlay, onEdit, onDelete, onAddToPlaylist }: TrackRowProps) => {
        const { trackId } = localTrack;
        const { data: track } = useTrack(trackId);
        const addToQueue = usePlayerStore((s) => s.addToQueue);
        const isPlaying = usePlayerStore((s) => selectCurrentTrackId(s) === trackId);
        const isLinked = localTrack.audio?.library === null;

        return (
            <div
                className={clsx(styles.row, { [styles["row--playing"]]: isPlaying })}
                onClick={() => onPlay(trackId)}
            >
                <span className={styles.index}>{index + 1}</span>

                <div className={styles.track}>
                    <Cover alt={track?.title ?? ""} src={track?.coverSrc ?? undefined} size="xs" />
                    <div className={styles.info}>
                        <span className={styles.title}>{track?.title}</span>
                        <span className={styles.artist}>{track?.metadataArtist}</span>
                    </div>
                </div>

                <div className={styles.type}>
                    <span
                        className={clsx(styles.badge, {
                            [styles.badgeLinked]: isLinked,
                            [styles.badgeCopied]: !isLinked,
                        })}
                    >
                        {isLinked ? "L" : "F"}
                    </span>
                </div>

                <span className={clsx(styles.center, styles.size)}>
                    {formatBytes(localTrack.audio?.sizeBytes)}
                </span>
                <span className={clsx(styles.center, styles.duration)}>
                    {formatTime(track?.durationMs ? track.durationMs / 1000 : 0)}
                </span>

                <Flex align="center" gap="2xs" className={styles.actions}>
                    <Button
                        variant="outline"
                        colorScheme={{
                            color: "var(--text-primary)",
                            colorHover: "var(--bg-primary)",
                        }}
                        square
                        onClick={(e) => {
                            e.stopPropagation();
                            addToQueue(trackId);
                        }}
                    >
                        <Icon name="player-list-end" size={13} />
                    </Button>

                    <Button
                        variant="outline"
                        colorScheme={{
                            color: "var(--text-primary)",
                            colorHover: "var(--bg-primary)",
                        }}
                        square
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToPlaylist(trackId);
                        }}
                    >
                        <Icon name="player-list-plus" size={13} />
                    </Button>

                    <Button
                        variant="outline"
                        colorScheme={{
                            color: "var(--text-primary)",
                            colorHover: "var(--bg-primary)",
                        }}
                        square
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(trackId);
                        }}
                    >
                        <Icon name="action-edit" size={13} />
                    </Button>

                    <Button
                        variant="outline"
                        colorScheme={{
                            color: "var(--text-primary)",
                            colorHover: "var(--bg-primary)",
                        }}
                        square
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Icon name="action-save" size={13} />
                    </Button>

                    <Button
                        variant="outline"
                        colorScheme={{ color: "var(--danger)" }}
                        square
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(trackId);
                        }}
                    >
                        <Icon name="action-delete" size={13} />
                    </Button>
                </Flex>
            </div>
        );
    },
);
