import styles from "./OfflinePage.module.scss";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Button, Cover, EmptyState, Flex, formatBytes, formatTime, Icon, Input } from "@zelefy/ui";
import { StorageDashboard } from "./StorageDashboard";
import { selectAudio } from "@/shared/lib/utils/browse";
import { useDeleteLocalTrack, useImportTracks, useLocalTracks } from "@/features/track";
import { type LocalTrackResponse } from "@/shared/types";
import { usePlayerStore } from "@/shared/lib/stores";
import { EditTrackModal } from "@/widgets/modal";
import { trackFileSrc } from "@/shared/lib/utils";
import { toPlayerTrack } from "@/shared/types/tracks";

export const OfflinePage = () => {
    const { t } = useTranslation();
    const [editingTrack, setEditingTrack] = useState<LocalTrackResponse | null>(null);

    const [search, setSearch] = useState("");
    const { data } = useLocalTracks();

    const { filteredTracks, playerTracks, allPlayerTracks } = useMemo(() => {
        const tracks = data ?? [];
        const q = search.trim().toLowerCase();

        const filtered = q
            ? tracks.filter(
                  (t) =>
                      t.title.toLowerCase().includes(q) ||
                      (t.metadataArtist ?? "").toLowerCase().includes(q),
              )
            : tracks;
        return {
            filteredTracks: filtered,
            playerTracks: filtered.map(toPlayerTrack),
            allPlayerTracks: tracks.map(toPlayerTrack),
        };
    }, [data, search]);

    const navigate = useNavigate();
    const { mutate: importTracks, isPending, progress } = useImportTracks();
    const playTrack = usePlayerStore((s) => s.playTrack);
    const addToQueue = usePlayerStore((s) => s.addToQueue);
    const currentTrack = usePlayerStore((s) => s.currentTrack);
    const { mutate: deleteTrack } = useDeleteLocalTrack();

    const handleBrowseFiles = async (currentPath?: string) => {
        const selected = await selectAudio(currentPath);
        if (!selected?.length) return;

        try {
            alert(`Выбранные файлы: ${selected}`);
            importTracks({ paths: selected });
        } catch (error) {
            console.error("Не удалось создать хранилища:", error);
        }
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
                                ? `Импорт ${progress.done}/${progress.total}`
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
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                        />
                    </div>
                </Flex>

                {filteredTracks.length > 0 ? (
                    <div className={styles.trackList}>
                        <div className={styles.header}>
                            <span className={styles.center}>#</span>
                            <span>{t("offline.list.header.track")}</span>
                            <span className={styles.center}>{t("offline.list.header.type")}</span>
                            <span className={styles.center}>{t("offline.list.header.weight")}</span>
                            <span className={styles.center}>{t("offline.list.header.time")}</span>
                        </div>

                        {filteredTracks.map((track, i) => {
                            const coverPath = trackFileSrc(track.cover);
                            const isLinked = track.cover?.library === null;
                            const isPlaying = track.trackId === currentTrack?.trackId;

                            return (
                                <div
                                    key={track.trackId}
                                    className={clsx(styles.row, {
                                        [styles["row--playing"]]: isPlaying,
                                    })}
                                    onClick={() => playTrack(playerTracks[i], allPlayerTracks)}
                                >
                                    <span className={styles.index}>{i + 1}</span>

                                    <div className={styles.track}>
                                        <Cover
                                            alt={track.title}
                                            src={coverPath ?? undefined}
                                            size="xs"
                                        />
                                        <div className={styles.info}>
                                            <span className={styles.title}>{track.title}</span>
                                            <span className={styles.artist}>
                                                {track.metadataArtist}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.type}>
                                        <span
                                            className={clsx(styles.badge, {
                                                [styles.badgeLinked]: isLinked,
                                                [styles.badgeCopied]: !isLinked,
                                            })}
                                        >
                                            {isLinked ? "L" : "F"}
                                        </span>
                                    </div>

                                    <span className={clsx(styles.center, styles.size)}>
                                        {formatBytes(track.audio.sizeBytes)}
                                    </span>
                                    <span className={clsx(styles.center, styles.duration)}>
                                        {formatTime(track.durationMs ? track.durationMs / 1000 : 0)}
                                    </span>

                                    <Flex align="center" gap="2xs" className={styles.actions}>
                                        <Button
                                            variant="outline"
                                            colorScheme={{
                                                color: "var(--text-primary)",
                                                colorHover: "var(--bg-primary)",
                                            }}
                                            square
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToQueue(playerTracks[i]);
                                            }}
                                        >
                                            <Icon name="player-list-end" size={13} />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            colorScheme={{
                                                color: "var(--text-primary)",
                                                colorHover: "var(--bg-primary)",
                                            }}
                                            square
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingTrack(track);
                                            }}
                                        >
                                            <Icon name="action-edit" size={13} />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            colorScheme={{
                                                color: "var(--text-primary)",
                                                colorHover: "var(--bg-primary)",
                                            }}
                                            square
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <Icon name="action-save" size={13} />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            colorScheme={{ color: "var(--danger)" }}
                                            square
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTrack(track.trackId);
                                            }}
                                        >
                                            <Icon name="action-delete" size={13} />
                                        </Button>
                                    </Flex>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState title={t("offline.list.empty")} />
                )}
            </Flex>

            <EditTrackModal
                key={editingTrack?.trackId ?? "empty"}
                open={!!editingTrack}
                onOpenChange={(open) => {
                    if (!open) setEditingTrack(null);
                }}
                track={editingTrack}
            />
        </>
    );
};
