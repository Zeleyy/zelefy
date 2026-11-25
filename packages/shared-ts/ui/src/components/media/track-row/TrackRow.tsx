import styles from "./TrackRow.module.scss";
import { memo, type CSSProperties, type ReactNode } from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import clsx from "clsx";
import type { PlayerTrack } from "@zelefy/types";
import { formatTime } from "../../../utils";
import { SpinnerLoader } from "../../loading";
import { Button, DragButton, Flex, Icon } from "../../primitives";
import { Cover } from "../covers";

export interface TrackRowDragProps {
    setNodeRef?: (node: HTMLElement | null) => void;
    style?: CSSProperties;
    listeners?: DraggableSyntheticListeners;
    attributes?: DraggableAttributes;
    isDragging?: boolean;
}

export interface TrackRowProps {
    index: number;
    track?: PlayerTrack | null;
    isActive?: boolean;
    isLoading?: boolean;
    unavailableText?: string;

    isDraggable?: boolean;
    dragProps?: TrackRowDragProps;

    onClick?: (index: number) => void;
    onTitleClick?: (track: PlayerTrack) => void;
    onAddToQueue?: (track: PlayerTrack) => void;
    onAddToPlaylist?: (track: PlayerTrack) => void;
    onRemove?: (track: PlayerTrack) => void;

    extraActions?: ReactNode;
}

export const TrackRow = memo(
    ({
        index,
        track,
        isActive = false,
        isLoading = false,
        unavailableText = "Track unavailable",
        isDraggable = false,
        dragProps,
        onClick,
        onTitleClick,
        onAddToQueue,
        onAddToPlaylist,
        onRemove,
        extraActions,
    }: TrackRowProps) => {
        const hasActions = Boolean(onAddToQueue || onAddToPlaylist || onRemove || extraActions);

        return (
            <div
                ref={dragProps?.setNodeRef}
                style={dragProps?.style}
                className={clsx(styles.row, {
                    [styles["row--active"]]: isActive,
                    [styles["row--dragging"]]: dragProps?.isDragging,
                    [styles["row--draggable"]]: isDraggable,
                    [styles["row--has-actions"]]: hasActions,
                })}
                role="option"
                aria-selected={isActive}
                onClick={() => onClick?.(index)}
            >
                <div className={styles.row__index}>
                    <span className={styles.row__indexNumber}>{index + 1}</span>
                    {isDraggable && (
                        <DragButton
                            className={styles.row__indexIcon}
                            attributes={dragProps?.attributes}
                            listeners={dragProps?.listeners}
                        />
                    )}
                </div>

                {track ? (
                    <>
                        <div className={styles.row__track}>
                            <Cover alt={track.title} src={track.coverSrc ?? undefined} size="xs" />
                            <span
                                className={clsx(styles.row__title, {
                                    [styles["row__title--clickable"]]: Boolean(onTitleClick),
                                })}
                                onClick={(e) => {
                                    if (!onTitleClick) return;
                                    e.stopPropagation();
                                    onTitleClick(track);
                                }}
                            >
                                {track.title}
                            </span>
                            {track.metadataArtist && (
                                <span className={styles.row__artist}>{track.metadataArtist}</span>
                            )}
                        </div>

                        <span className={styles.row__duration}>
                            {formatTime(track.durationMs ? track.durationMs / 1000 : 0)}
                        </span>
                    </>
                ) : isLoading ? (
                    <SpinnerLoader isLoading />
                ) : (
                    <span className={styles.row__unavailable}>{unavailableText}</span>
                )}

                {track && hasActions && (
                    <Flex align="center" gap="2xs" className={styles.row__actions}>
                        {onAddToQueue && (
                            <Button
                                variant="outline"
                                colorScheme={{
                                    color: "var(--text-primary)",
                                    colorHover: "var(--bg-primary)",
                                }}
                                square
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToQueue(track);
                                }}
                            >
                                <Icon name="player-list-end" size={13} />
                            </Button>
                        )}

                        {onAddToPlaylist && (
                            <Button
                                variant="outline"
                                colorScheme={{
                                    color: "var(--text-primary)",
                                    colorHover: "var(--bg-primary)",
                                }}
                                square
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToPlaylist(track);
                                }}
                            >
                                <Icon name="player-list-plus" size={13} />
                            </Button>
                        )}

                        {onRemove && (
                            <Button
                                variant="outline"
                                colorScheme={{ color: "var(--danger)" }}
                                square
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(track);
                                }}
                            >
                                <Icon name="action-delete" size={13} />
                            </Button>
                        )}

                        {extraActions}
                    </Flex>
                )}
            </div>
        );
    },
);
