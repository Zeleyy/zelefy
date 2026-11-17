import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Flex, InputLabel } from "@zelefy/ui";
import type { LocalTrackResponse } from "@/entities/track";
import type { PlaylistWithFirstTrackId } from "@/entities/playlist";
import { useCreateLocalPlaylist } from "../../hooks";
import { CreatedPlaylistView } from "../CreatedPlaylistView";

export const CreatePlaylistTab = ({ track }: { track: LocalTrackResponse }) => {
    const { t } = useTranslation();

    const { mutate: createLocalPlaylist, isSuccess } = useCreateLocalPlaylist();
    const [title, setTitle] = useState(track.title);
    const [newPlaylist, setNewPlaylist] = useState<PlaylistWithFirstTrackId | null>(null);

    const handleCreate = () => {
        createLocalPlaylist(
            { title, description: null, trackId: track.trackId },
            { onSuccess: (playlist) => setNewPlaylist(playlist) },
        );
    };

    if (isSuccess && newPlaylist) {
        return <CreatedPlaylistView playlist={newPlaylist} />;
    }

    return (
        <>
            <InputLabel
                label={t("modal.add_to_playlist.tab.create.field.label")}
                placeholder={t("modal.add_to_playlist.tab.create.field.placeholder")}
                defaultValue={track.title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <Flex justify="space-between">
                <div />
                <Button onClick={handleCreate}>{t("common.save")}</Button>
            </Flex>
        </>
    );
};
