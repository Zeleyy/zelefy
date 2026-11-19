import { useNavigate } from "react-router";
import { PlaylistCard } from "@zelefy/ui";
import { queryClient } from "@/shared/api";
import {
    localPlaylistAllTrackIdsOptions,
    type PlaylistWithFirstTrackId,
} from "@/entities/playlist";
import { selectCurrentPlaylistId, usePlayerStore, useTrack } from "@/features/player";

export const PlaylistCardWithTrack = ({ playlist }: { playlist: PlaylistWithFirstTrackId }) => {
    const navigate = useNavigate();

    const playTrack = usePlayerStore((s) => s.playTrack);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const currentPlaylistId = usePlayerStore((s) => selectCurrentPlaylistId(s));
    const isCurrentPlaylist = currentPlaylistId === playlist.playlistId;

    const { data: track } = useTrack(playlist.trackId ?? undefined);

    const handlePlay = async () => {
        const trackIds = await queryClient.query(
            localPlaylistAllTrackIdsOptions(playlist.playlistId),
        );
        if (!trackIds?.length) return;
        playTrack(trackIds[0], trackIds, playlist.playlistId);
    };

    return (
        <PlaylistCard
            title={playlist.title}
            coverSrc={track?.coverSrc ?? undefined}
            isPlaying={isPlaying && isCurrentPlaylist}
            onPlayClick={() => {
                if (isCurrentPlaylist) {
                    togglePlay();
                    return;
                }
                if (!playlist.trackId) return;
                void handlePlay();
            }}
            onOpen={() => {
                void navigate(`/playlist/${playlist.playlistId}`);
            }}
        />
    );
};
