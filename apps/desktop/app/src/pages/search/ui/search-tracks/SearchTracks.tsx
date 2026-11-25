import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TrackId } from "@zelefy/types";
import { useModalStore } from "@/shared/lib/stores";
import { useCurrentTrack, useLocalTrackIds } from "@/features/player";
import { SearchResults } from "../SearchResults";
import { TrackRow } from "../track-row";
import { useSearchContext } from "../../model/useSearchContext";

export const SearchTracks = () => {
    const { query, source, isTyping } = useSearchContext();

    const { t } = useTranslation();
    const canFetch = query.length > 0;

    const openModal = useModalStore((s) => s.openModal);
    const currentTrack = useCurrentTrack();

    const local = useLocalTrackIds({
        search: canFetch ? query : undefined,
        enabled: canFetch,
    });

    const remote = useMemo(
        () => ({
            data: { pages: [{ items: [] as string[] }] },
            isLoading: false,
            isError: false,
            fetchNextPage: () => {},
            hasNextPage: false,
            isFetchingNextPage: false,
        }),
        [],
    );

    const localIds = canFetch ? (local.data?.pages.flatMap((p) => p.items) ?? []) : [];
    const remoteIds = canFetch ? (remote.data?.pages.flatMap((p) => p.items) ?? []) : [];
    const trackIds: TrackId[] = source === "local" ? localIds : [...localIds, ...remoteIds];

    const activeSources = source === "all" ? [local, remote] : [local];

    const fetchNextPage = useCallback(() => {
        if (local.hasNextPage) void local.fetchNextPage();
        if (source !== "local" && remote.hasNextPage) remote.fetchNextPage();
    }, [source, local, remote]);

    const addToPlaylist = useCallback(
        (trackId: TrackId) => openModal("addToPlaylist", { trackId }),
        [openModal],
    );

    return (
        <SearchResults
            isLoading={activeSources.some((s) => s.isLoading)}
            isError={activeSources.every((s) => s.isError)}
            isEmpty={trackIds.length === 0}
            isStale={isTyping}
            errorTitle={source === "local" ? t("search.local.error") : undefined}
            hasNextPage={canFetch && activeSources.some((s) => s.hasNextPage)}
            isFetchingNextPage={canFetch && activeSources.some((s) => s.isFetchingNextPage)}
            fetchNextPage={fetchNextPage}
        >
            {trackIds.map((trackId) => (
                <TrackRow
                    key={trackId}
                    trackId={trackId}
                    isCurrent={currentTrack?.trackId === trackId}
                    onAddToPlaylist={addToPlaylist}
                />
            ))}
        </SearchResults>
    );
};
