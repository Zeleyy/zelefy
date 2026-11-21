import { useCallback, useMemo, useState } from "react";
import { EmptyState, Flex, Tabs } from "@zelefy/ui";
import { useModalStore, useSearchStore } from "@/shared/lib/stores";
import { useCurrentTrack, useLocalTrackIds } from "@/features/player";
import { useTranslation } from "react-i18next";
import { InfiniteScrollFooter } from "@/shared/ui";
import { TrackRow } from "./TrackRow";
import type { TrackId } from "@/entities/track";

type SearchSource = "all" | "local" | "zelefy";
type SearchType = "tracks" | "playlists" | "users";

export const SearchPage = () => {
    const { t } = useTranslation();
    const [source, setSource] = useState<SearchSource>("all");
    const [type, setType] = useState<SearchType>("tracks");
    const q = useSearchStore((s) => s.q);
    const openModal = useModalStore((s) => s.openModal);
    const currentTrack = useCurrentTrack();

    const hasQuery = q.trim().length > 0;
    const isTrackSearch = type === "tracks";

    const local = useLocalTrackIds({
        search: q,
        enabled: hasQuery && isTrackSearch && source !== "zelefy",
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

    const localIds = local.data?.pages.flatMap((p) => p.items) ?? [];
    const remoteIds = remote.data?.pages.flatMap((p) => p.items) ?? [];

    const visibleTrackIds: TrackId[] =
        source === "local"
            ? localIds
            : source === "zelefy"
              ? remoteIds
              : [...localIds, ...remoteIds];

    const activeSources =
        source === "all" ? [local, remote] : source === "local" ? [local] : [remote];

    const isLoading = activeSources.every((s) => s.isLoading);
    const isError = activeSources.every((s) => s.isError);
    const hasNextPage = activeSources.some((s) => s.hasNextPage);
    const isFetchingNextPage = activeSources.some((s) => s.isFetchingNextPage);

    const fetchNextPage = useCallback(() => {
        if (source !== "zelefy" && local.hasNextPage) void local.fetchNextPage();
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
                        { label: "Zelefy", value: "zelefy" },
                    ]}
                    active={source}
                    onTabClick={setSource}
                />

                {hasQuery && source !== "zelefy" && (
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
            ) : source === "zelefy" ? (
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
