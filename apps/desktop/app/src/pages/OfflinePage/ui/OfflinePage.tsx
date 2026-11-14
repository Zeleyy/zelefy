import styles from "./OfflinePage.module.scss";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button, EmptyState, Flex, Input } from "@zelefy/ui";
import { selectAudio } from "@/shared/lib/utils/browse";
import type { TrackId } from "@/entities/track";
import {
    useDeleteLocalTrack,
    useEnsureTracks,
    useImportTracks,
    useLocalTracks,
    usePlayerStore,
} from "@/features/player";
import { EditTrackModal } from "@/widgets/modal";
import { StorageDashboard } from "./StorageDashboard";
import { TrackRow } from "./TrackRow";

export const OfflinePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [editingTrackId, setEditingTrackId] = useState<TrackId | null>(null);

    const { data } = useLocalTracks();
    const localTracks = data ?? [];

    const trackIds = useMemo(() => (data ?? []).map((t) => t.trackId), [data]);
    useEnsureTracks(trackIds);

    const { mutate: importTracks, isPending, progress } = useImportTracks();
    const { mutate: deleteTrack } = useDeleteLocalTrack();
    const playTrack = usePlayerStore((s) => s.playTrack);

    const handlePlay = useCallback(
        (trackId: TrackId) => playTrack(trackId, trackIds),
        [playTrack, trackIds],
    );
    const handleEdit = useCallback((trackId: TrackId) => setEditingTrackId(trackId), []);
    const handleDelete = useCallback(
        (trackId: TrackId) => deleteTrack(Number(trackId)),
        [deleteTrack],
    );

    const handleBrowseFiles = async (currentPath?: string) => {
        const selected = await selectAudio(currentPath);
        if (!selected?.length) return;
        importTracks({ paths: selected });
    };

    return (
        <>
            <Flex direction="column" gap="lg" size="page-md" container fullWidth>
                <Flex as="header" justify="space-between" align="flex-end" wrap="wrap" gap="md">
                    <h1>{t("offline.title")}</h1>
                    <Flex gap="md">
                        <Button variant="secondary" onClick={() => navigate("/settings/storage")}>
                            {t("offline.storage.settings")}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                handleBrowseFiles();
                            }}
                        >
                            {isPending && progress
                                ? progress.done + "/" + progress.total
                                : t("offline.actions.add.files")}
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
                            placeholder={t("offline.controls.search.placeholder")}
                            onChange={() => {
                                // setSearch(e.target.value);
                            }}
                        />
                    </div>
                </Flex>

                {localTracks.length > 0 ? (
                    <div className={styles.trackList}>
                        <div className={styles.header}>
                            <span className={styles.center}>#</span>
                            <span>{t("offline.list.header.track")}</span>
                            <span className={styles.center}>{t("offline.list.header.type")}</span>
                            <span className={styles.center}>{t("offline.list.header.weight")}</span>
                            <span className={styles.center}>{t("offline.list.header.time")}</span>
                        </div>

                        {localTracks.map((localTrack, i) => (
                            <TrackRow
                                key={localTrack.trackId}
                                index={i}
                                localTrack={localTrack}
                                onPlay={handlePlay}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState title={t("offline.list.empty")} />
                )}
            </Flex>

            <EditTrackModal
                key={editingTrackId ?? "empty"}
                open={editingTrackId !== null}
                onOpenChange={(open) => {
                    if (!open) setEditingTrackId(null);
                }}
                trackId={editingTrackId}
            />
        </>
    );
};
