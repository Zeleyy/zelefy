import styles from "./QueueRow.module.scss";
import type { CSSProperties } from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import clsx from "clsx";
import type { PlayerTrack } from "@zelefy/types";
import { Button, Cover, DragButton, formatTime, Icon, SpinnerLoader } from "@zelefy/ui";

interface QueueRowProps {
    index: number;
    track?: PlayerTrack | null;
    isActive?: boolean;
    onRowClick?: () => void;
    onRemoveFromQueue?: () => void;
    setNodeRef?: (node: HTMLElement | null) => void;
    style?: CSSProperties;
    listeners?: DraggableSyntheticListeners;
    attributes?: DraggableAttributes;
    isDragging?: boolean;
}

export const QueueRow = ({
    index,
    track,
    isActive = false,
    onRowClick,
    onRemoveFromQueue,
    setNodeRef,
    style,
    listeners,
    attributes,
    isDragging = false,
}: QueueRowProps) => {
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(styles.queue__row, {
                [styles["queue__row--active"]]: isActive,
                [styles["queue__row--dragging"]]: isDragging,
            })}
            role="option"
            aria-selected={isActive}
            onClick={onRowClick}
        >
            <div className={styles.queue__index}>
                <span className={styles.queue__indexNumber}>{index + 1}</span>
                <DragButton
                    className={styles.queue__indexIcon}
                    attributes={attributes}
                    listeners={listeners}
                />
            </div>

            {track ? (
                <>
                    <div className={styles.queue__track}>
                        <Cover alt={track.title} src={track.coverSrc ?? undefined} size="xs" />
                        <div className={styles.queue__info}>
                            <span className={styles.queue__title}>{track.title}</span>
                            <span className={styles.queue__artist}>{track.metadataArtist}</span>
                        </div>
                    </div>

                    <span className={styles.queue__duration}>
                        {formatTime(track.durationMs ? track.durationMs / 1000 : 0)}
                    </span>
                </>
            ) : (
                <SpinnerLoader isLoading />
            )}

            <div className={styles.queue__actions}>
                <Button
                    variant="ghost"
                    colorScheme={{ bgColorHover: "transparent" }}
                    square
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <Icon name="player-heart" size={14} />
                </Button>

                {!isActive && (
                    <Button
                        variant="ghost"
                        square
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromQueue?.();
                        }}
                    >
                        <Icon name="action-close" size={14} />
                    </Button>
                )}
            </div>
        </div>
    );
};
