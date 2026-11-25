import { type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import type { TrackId } from "@zelefy/types";
import { TrackRow } from "@zelefy/ui";
import { useTrack } from "@/features/player";
import { useAddToQueue } from "@/features/queue";

interface PlaylistTrackRowProps {
    index: number;
    trackId: TrackId;
    isActive?: boolean;
    isLoading?: boolean;
    canEdit?: boolean;
    onRowClick: (index: number) => void;
    onAddToPlaylist: (trackId: TrackId) => void;
    onRemoveFromPlaylist?: (trackId: TrackId) => void;
    setNodeRef?: (node: HTMLElement | null) => void;
    style?: CSSProperties;
    listeners?: DraggableSyntheticListeners;
    attributes?: DraggableAttributes;
    isDragging?: boolean;
}

export const PlaylistTrackRow = ({
    trackId,
    index,
    isActive,
    canEdit,
    onRowClick,
    onAddToPlaylist,
    onRemoveFromPlaylist,
    ...dndProps
}: PlaylistTrackRowProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: track, isLoading } = useTrack(trackId);
    const addToQueue = useAddToQueue();

    return (
        <TrackRow
            index={index}
            track={track}
            isActive={isActive}
            isLoading={isLoading}
            unavailableText={t("playlist.row.unavailable")}
            isDraggable={canEdit}
            dragProps={dndProps}
            onClick={onRowClick}
            onTitleClick={(item) => void navigate(`/track/${item.trackId}`)}
            onAddToQueue={addToQueue}
            onAddToPlaylist={(item) => onAddToPlaylist(item.trackId)}
            onRemove={
                canEdit && onRemoveFromPlaylist
                    ? (item) => onRemoveFromPlaylist(item.trackId)
                    : undefined
            }
        />
    );
};
