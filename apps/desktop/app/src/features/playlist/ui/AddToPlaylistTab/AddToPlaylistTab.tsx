import { useTranslation } from "react-i18next";
import { Flex, Input, SpinnerLoader } from "@zelefy/ui";
import type { LocalTrackResponse } from "@/entities/track";
import { useAddLocalPlaylistEnd, useLocalPlaylistsWithFirstTrackId } from "../../hooks";
import { PlaylistRow } from "../PlaylistRow";

interface AddToPlaylistTabProps {
    track: LocalTrackResponse;
}

export const AddToPlaylistTab = ({ track }: AddToPlaylistTabProps) => {
    const { t } = useTranslation();
    const { data: playlists, isLoading } = useLocalPlaylistsWithFirstTrackId();
    const { mutate: addToLocalPlaylist } = useAddLocalPlaylistEnd();

    return (
        <>
            <Input placeholder={t("modal.add_to_playlist.tab.add.search.placeholder")} />

            <Flex direction="column" gap="sm">
                {isLoading || !playlists ? (
                    <SpinnerLoader isLoading />
                ) : (
                    playlists.map((playlist) => (
                        <PlaylistRow
                            key={playlist.playlistId}
                            playlist={playlist}
                            trackId={track.trackId}
                            onAddClick={(playlistId, trackId) =>
                                addToLocalPlaylist({ playlistId, trackId })
                            }
                        />
                    ))
                )}
            </Flex>
        </>
    );
};
