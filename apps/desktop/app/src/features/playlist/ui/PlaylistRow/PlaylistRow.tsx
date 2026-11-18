import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Cover, Flex } from "@zelefy/ui";
import type { PlaylistWithFirstTrackId } from "@/entities/playlist";
import { useTrack } from "@/features/player";
import { useLocalPlaylistAllTrackIds } from "../../hooks";

interface PlaylistRowProps {
    playlist: PlaylistWithFirstTrackId;
    trackId: number;
    onAddClick: (playlistId: number, trackId: number) => void;
}

export const PlaylistRow = memo(({ playlist, trackId, onAddClick }: PlaylistRowProps) => {
    const { t } = useTranslation();
    const { data: track } = useTrack(playlist.trackId ?? undefined);
    const { data: trackIds } = useLocalPlaylistAllTrackIds(playlist.playlistId);

    const isAdded = trackIds?.includes(trackId) ?? false;

    return (
        <Flex align="center" gap="sm">
            <Cover alt={track?.title ?? ""} src={track?.coverSrc ?? undefined} size="sm" />

            <div style={{ flex: 1 }}>
                <h4>{playlist.title}</h4>
            </div>

            <Button
                variant={isAdded ? "secondary" : "primary"}
                size="small"
                onClick={() => {
                    if (isAdded) return;
                    onAddClick(playlist.playlistId, trackId);
                }}
            >
                {isAdded ? t("common.added") : t("common.add")}
            </Button>
        </Flex>
    );
});
