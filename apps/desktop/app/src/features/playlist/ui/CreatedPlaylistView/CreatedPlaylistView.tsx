import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button, Cover, Flex } from "@zelefy/ui";
import type { PlaylistWithFirstTrackId } from "@/entities/playlist";
import { useTrack } from "@/features/player";
import { useModalStore } from "@/shared/lib/stores";

export const CreatedPlaylistView = ({ playlist }: { playlist: PlaylistWithFirstTrackId }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const closeCurrentModal = useModalStore((s) => s.closeCurrentModal);
    const { data: track } = useTrack(playlist.trackId ?? undefined);

    return (
        <Flex align="center" gap="sm">
            <Cover alt={track?.title ?? ""} src={track?.coverSrc ?? undefined} size="sm" />
            <h4 style={{ flex: 1 }}>{playlist.title}</h4>
            <Button
                onClick={() => {
                    closeCurrentModal();
                    navigate("/playlist/" + playlist.playlistId);
                }}
            >
                {t("modal.add_to_playlist.tab.create.go_to")}
            </Button>
        </Flex>
    );
};
