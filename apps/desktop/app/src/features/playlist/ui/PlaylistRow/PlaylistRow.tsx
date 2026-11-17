import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Cover, Flex } from "@zelefy/ui";
import type { PlaylistWithFirstTrackId } from "@/entities/playlist";
import { useTrack } from "@/features/player";

interface PlaylistRowProps {
    playlist: PlaylistWithFirstTrackId;
    onAddClick: (playlistId: number, trackId: number) => void;
}

export const PlaylistRow = memo(({ playlist, onAddClick }: PlaylistRowProps) => {
    const { t } = useTranslation();
    const { data: track } = useTrack(playlist.trackId ?? undefined);

    return (
        <Flex align="center" gap="sm">
            <Cover alt={track?.title ?? ""} src={track?.coverSrc ?? undefined} size="sm" />

            <div style={{ flex: 1 }}>
                <h4>{playlist.title}</h4>
            </div>

            <Button
                size="small"
                onClick={() => {
                    if (playlist.trackId) {
                        onAddClick(playlist.playlistId, playlist.trackId);
                    }
                }}
            >
                {t("common.add")}
            </Button>
        </Flex>
    );
});
