import { useTranslation } from "react-i18next";
import { PlaylistList } from "@zelefy/ui";
import { useLocalPlaylistsWithFirstTrackId } from "@/features/playlist";
import { PlaylistCardWithTrack } from "./PlaylistCardWithTrack";

export const LibraryPage = () => {
    const { t } = useTranslation();
    const { data: localPlaylists } = useLocalPlaylistsWithFirstTrackId();

    return (
        <>
            <h1>{t("library.title")}</h1>

            <PlaylistList title={t("library.local")} layout="row">
                {localPlaylists?.map((playlist) => (
                    <PlaylistCardWithTrack key={playlist.playlistId} playlist={playlist} />
                ))}
            </PlaylistList>
        </>
    );
};
