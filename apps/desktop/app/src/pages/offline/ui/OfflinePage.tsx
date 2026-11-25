import styles from "./OfflinePage.module.scss";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { TrackId } from "@zelefy/types";
import { Button, EmptyState, Flex, Input, SpinnerLoader } from "@zelefy/ui";
import { useModalStore } from "@/shared/lib/stores";
import { selectAudio } from "@/shared/lib/utils/browse";
import { useDebounce } from "@/shared/lib/hooks";
import { InfiniteScrollFooter } from "@/shared/ui";
import { useDeleteLocalTrack, useLocalTracks, usePlayerStore } from "@/features/player";
import { StorageDashboard } from "./storage-dashboard";
import { TrackRow } from "./track-row";

export const OfflinePage = () => {
    const { t } = useTranslation();

    const openModal = useModalStore((s) => s.openModal);
    const playTrack = usePlayerStore((s) => s.playTrack);

    const [input, setInput] = useState("");
    const search = useDebounce(input.trim(), 500, "");

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
        useLocalTracks({ search });

    const { mutate: deleteTrack } = useDeleteLocalTrack();

    const localTracks = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
    const trackIds = useMemo<TrackId[]>(
        () => localTracks.map((item) => item.trackId),
        [localTracks],
    );

    const handlePlay = useCallback(
        (trackId: TrackId) => playTrack(trackId, trackIds),
        [playTrack, trackIds],
    );

    const handleAddToPlaylist = useCallback(
        (trackId: TrackId) => openModal("addToPlaylist", { trackId }),
        [openModal],
    );

    const handleEdit = useCallback(
        (trackId: TrackId) => openModal("editTrack", { trackId }),
        [openModal],
    );

    const handleDelete = useCallback(
        (trackId: TrackId) => deleteTrack(Number(trackId)),
        [deleteTrack],
    );

    const handleBrowseFiles = useCallback(
        async (currentPath?: string) => {
            const selected = await selectAudio(currentPath);
            if (!selected?.length) return;
            openModal("importTracks", { paths: selected });
        },
        [openModal],
    );

    if (isError) return <EmptyState title={t("offline.list.error")} description={String(error)} />;

    return (
        <>
            <Flex direction="column" gap="lg" size="page-md" container fullWidth>
                <Flex as="header" justify="space-between" align="flex-end" wrap="wrap" gap="md">
                    <h1>{t("offline.title")}</h1>
                    <Flex gap="md">
                        <Button as={Link} to="/settings/storage" variant="secondary">
                            {t("offline.storage.settings")}
                        </Button>
                        <Button variant="primary" onClick={() => void handleBrowseFiles()}>
                            {t("offline.actions.add.files")}
                        </Button>
                    </Flex>
                </Flex>

                <StorageDashboard />

                <Flex
                    as="section"
                    justify="space-between"
                    align="center"
                    gap="md"
                    className={styles.controls}
                >
                    <div className={styles.search}>
                        <Input
                            value={input}
                            placeholder={t("offline.controls.search.placeholder")}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                </Flex>

                {isError ? (
                    <EmptyState title={t("offline.list.error")} description={String(error)} />
                ) : trackIds.length > 0 ? (
                    <div className={styles.trackList}>
                        <div className={styles.header}>
                            <span className={styles.center}>#</span>
                            <span>{t("offline.list.header.track")}</span>
                            <span className={styles.center}>{t("offline.list.header.type")}</span>
                            <span className={styles.center}>{t("offline.list.header.weight")}</span>
                            <span className={styles.center}>{t("offline.list.header.time")}</span>
                        </div>

                        {isLoading ? (
                            <Flex align="center" justify="center">
                                <SpinnerLoader isLoading />
                            </Flex>
                        ) : (
                            localTracks.map((localTrack, i) => (
                                <TrackRow
                                    key={localTrack.trackId}
                                    index={i}
                                    localTrack={localTrack}
                                    onPlay={handlePlay}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onAddToPlaylist={handleAddToPlaylist}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <EmptyState title={t("offline.list.empty")} />
                )}
            </Flex>

            <InfiniteScrollFooter
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
            />
        </>
    );
};
