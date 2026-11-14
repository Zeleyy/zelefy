import { useParams } from "react-router";

export const PlaylistPage = () => {
    const { playlistId } = useParams();

    return <div>playlist page {playlistId}</div>;
};
