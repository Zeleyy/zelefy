import styles from "./PlaylistTrackRow.module.scss";
import { memo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import clsx from "clsx";
import { Button, Cover, DragButton, Flex, formatTime, Icon, SpinnerLoader } from "@zelefy/ui";
import type { TrackId } from "@/entities/track";
import { usePlayerStore, useTrack } from "@/features/player";

interface PlaylistTrackRowProps {
    index: number;
    trackId: TrackId;
    isActive?: boolean;
    isLoading?: boolean;
    onRowClick: (index: number) => void;
    onAddToPlaylist: (trackId: TrackId) => void;
    onRemoveFromPlaylist: (trackId: TrackId) => void;
    setNodeRef?: (node: HTMLElement | null) => void;
    style?: CSSProperties;
    listeners?: DraggableSyntheticListeners;
    attributes?: DraggableAttributes;
    isDragging?: boolean;
}

export const PlaylistTrackRow = memo(
    ({
        index,
        trackId,
        isLoading,
        isActive = false,
        onRowClick,
        onAddToPlaylist,
        onRemoveFromPlaylist,
        setNodeRef,
        style,
        listeners,
        attributes,
        isDragging = false,
    }: PlaylistTrackRowProps) => {
        const { t } = useTranslation();
        const { data: track } = useTrack(trackId);
        const addToQueue = usePlayerStore((s) => s.addToQueue);

        return (
            <div
                ref={setNodeRef}
                style={style}
                className={clsx(styles.row, {
                    [styles["row--active"]]: isActive,
                    [styles["row--dragging"]]: isDragging,
                })}
                role="option"
                aria-selected={isActive}
                onClick={() => onRowClick(index)}
            >
                <div className={styles.row__index}>
                    <span className={styles.row__indexNumber}>{index + 1}</span>
                    <DragButton
                        className={styles.row__indexIcon}
                        attributes={attributes}
                        listeners={listeners}
                    />
                </div>

                {track ? (
                    <>
                        <div className={styles.row__track}>
                            <Cover alt={track.title} src={track.coverSrc ?? undefined} size="xs" />
                            <Link
                                to={`/track/${trackId}`}
                                className={styles.row__title}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {track.title}
                            </Link>
                            <span className={styles.row__artist}>{track.metadataArtist}</span>
                        </div>

                        <span className={styles.row__duration}>
                            {formatTime(track.durationMs ? track.durationMs / 1000 : 0)}
                        </span>
                    </>
                ) : isLoading ? (
                    <SpinnerLoader isLoading />
                ) : (
                    <span className={styles.row__unavailable}>{t("playlist.row.unavailable")}</span>
                )}

                <Flex align="center" gap="2xs" className={styles.row__actions}>
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
                        colorScheme={{ color: "var(--danger)" }}
                        square
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromPlaylist(trackId);
                        }}
                    >
                        <Icon name="action-delete" size={13} />
                    </Button>
                </Flex>
            </div>
        );
    },
);
