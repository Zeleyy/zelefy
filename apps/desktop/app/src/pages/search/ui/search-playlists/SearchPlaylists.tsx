import { useLocalPlaylistsPaged } from "@/features/playlist";
import type { SearchTabProps } from "../../model/types";
import { PlaylistRow } from "../playlist-row";
import { SearchResults } from "../SearchResults";

export const SearchPlaylists = ({ query, isTyping }: SearchTabProps) => {
    const canFetch = query.length > 0 && !isTyping;

    const local = useLocalPlaylistsPaged({
        search: canFetch ? query : undefined,
        enabled: canFetch,
    });

    const playlists = canFetch ? (local.data?.pages.flatMap((p) => p.items) ?? []) : [];

    return (
        <SearchResults
            isLoading={isTyping || local.isLoading}
            isError={!isTyping && local.isError}
            isEmpty={playlists.length === 0}
            hasNextPage={canFetch && local.hasNextPage}
            isFetchingNextPage={canFetch && local.isFetchingNextPage}
            fetchNextPage={() => void local.fetchNextPage()}
        >
            {playlists.map((playlist) => (
                <PlaylistRow key={playlist.playlistId} playlist={playlist} />
            ))}
        </SearchResults>
    );
};
