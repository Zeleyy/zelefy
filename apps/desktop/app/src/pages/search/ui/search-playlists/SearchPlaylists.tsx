import { useLocalPlaylistsPaged } from "@/features/playlist";
import { PlaylistRow } from "../playlist-row";
import { SearchResults } from "../SearchResults";
import { useSearchContext } from "../../model/useSearchContext";

export const SearchPlaylists = () => {
    const { query, isTyping } = useSearchContext();

    const canFetch = query.length > 0;

    const local = useLocalPlaylistsPaged({
        search: canFetch ? query : undefined,
        enabled: canFetch,
    });

    const playlists = canFetch ? (local.data?.pages.flatMap((p) => p.items) ?? []) : [];

    return (
        <SearchResults
            isLoading={local.isLoading}
            isError={local.isError}
            isEmpty={playlists.length === 0}
            isStale={isTyping}
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
