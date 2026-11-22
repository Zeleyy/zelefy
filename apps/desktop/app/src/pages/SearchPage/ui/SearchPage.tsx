import { useCallback, useMemo, useState } from "react";
import { EmptyState, Flex, Tabs } from "@zelefy/ui";
import { useModalStore, useSearchStore } from "@/shared/lib/stores";
import { useCurrentTrack, useLocalTrackIds } from "@/features/player";
import { useTranslation } from "react-i18next";
import { InfiniteScrollFooter } from "@/shared/ui";
import { useDebounce } from "@/shared/lib/hooks";
import type { TrackId } from "@/entities/track";
import { useActiveServer } from "@/entities/servers";
import { TrackRow } from "./TrackRow";

type SearchSource = "all" | "local" | "remote";
type SearchType = "tracks" | "playlists" | "users";

export const SearchPage = () => {
    const { t } = useTranslation();
    const [source, setSource] = useState<SearchSource>("all");
    const [type, setType] = useState<SearchType>("tracks");
    const openModal = useModalStore((s) => s.openModal);
    const currentTrack = useCurrentTrack();

    const q = useSearchStore((s) => s.q);
    const debouncedQ = useDebounce(q, 500, "");

    const { data: activeServer } = useActiveServer();
    const activeServerName = activeServer?.serverName ?? "";

    const trimmedQ = q.trim();
    const hasQuery = trimmedQ.length > 0;
    const trimmedDebouncedQ = debouncedQ.trim();

    const isTyping = trimmedQ !== trimmedDebouncedQ;
    const hasDebouncedQuery = trimmedDebouncedQ.length > 0;
    const isTrackSearch = type === "tracks";

    const canFetch = hasDebouncedQuery && !isTyping && isTrackSearch && source !== "remote";

    const local = useLocalTrackIds({
        search: canFetch ? trimmedDebouncedQ : undefined,
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

    const visibleTrackIds: TrackId[] =
        source === "local"
            ? localIds
            : source === "remote"
              ? remoteIds
              : [...localIds, ...remoteIds];

    const activeSources =
        source === "all" ? [local, remote] : source === "local" ? [local] : [remote];

    const isLoading = isTyping || activeSources.some((s) => s.isLoading);
    const isError = !isTyping && activeSources.every((s) => s.isError);
    const hasNextPage = canFetch && activeSources.some((s) => s.hasNextPage);
    const isFetchingNextPage = canFetch && activeSources.some((s) => s.isFetchingNextPage);

    const fetchNextPage = useCallback(() => {
        if (source !== "remote" && local.hasNextPage) void local.fetchNextPage();
        if (source !== "local" && remote.hasNextPage) remote.fetchNextPage();
    }, [source, local, remote]);

    const addToPlaylist = useCallback(
        (trackId: TrackId) => openModal("addToPlaylist", { trackId }),
        [openModal],
    );

    return (
        <Flex direction="column" align="center" gap="lg">
            <Flex direction="column" align="center" gap="xs">
                <Tabs<SearchSource>
                    tabs={[
                        { label: t("search.source.all"), value: "all" },
                        { label: t("search.source.local"), value: "local" },
                        { label: activeServerName, value: "remote" },
                    ]}
                    active={source}
                    onTabClick={setSource}
                />

                {hasDebouncedQuery && source !== "remote" && (
                    <Tabs<SearchType>
                        variant="primary"
                        shape="underline"
                        tabs={[
                            { label: t("search.type.tracks"), value: "tracks" },
                            { label: t("search.type.playlists"), value: "playlists" },
                            { label: t("search.type.users"), value: "users" },
                        ]}
                        active={type}
                        onTabClick={setType}
                    />
                )}
            </Flex>

            {!hasQuery ? (
                <EmptyState title={t("search.start")} />
            ) : source === "remote" ? (
                <EmptyState title={t("common.in_development")} />
            ) : (
                <>
                    {isError && (
                        <EmptyState
                            title={
                                source === "local"
                                    ? t("search.local.error")
                                    : t("search.result.error")
                            }
                        />
                    )}

                    {!isLoading && !isError && visibleTrackIds.length === 0 && (
                        <EmptyState
                            title={t("search.result.empty")}
                            description={t("search.result.empty_description")}
                        />
                    )}

                    {visibleTrackIds.length > 0 && (
                        <Flex direction="column" gap="xs" fullWidth>
                            {visibleTrackIds.map((trackId) => (
                                <TrackRow
                                    key={trackId}
                                    trackId={trackId}
                                    isCurrent={currentTrack?.trackId === trackId}
                                    onAddToPlaylist={(id) => addToPlaylist(id)}
                                />
                            ))}
                        </Flex>
                    )}

                    <InfiniteScrollFooter
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                    />
                </>
            )}
        </Flex>
    );
};
