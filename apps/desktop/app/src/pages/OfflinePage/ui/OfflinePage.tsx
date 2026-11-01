import styles from "./OfflinePage.module.scss";
import { useState } from "react";
import { useNavigate } from "react-router";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Button, Cover, Flex, formatBytes, formatTime, Icon, Input } from "@zelefy/ui";
import { StorageDashboard } from "./StorageDashboard";
import { selectAudio } from "@/shared/lib/utils/browse";
import { useImportTracks, useLocalTracks } from "@/features/track";
import { type LocalTrackResponse } from "@/shared/types";
import { usePlayerStore } from "@/shared/lib/stores";
import { EditTrackModal } from "@/widgets/modal";

export const OfflinePage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<"all" | "imported" | "cache">("all");
    const [editingTrack, setEditingTrack] = useState<LocalTrackResponse | null>(null);

    const navigate = useNavigate();
    const { mutate: importTracks, isPending, progress } = useImportTracks();
    const { data } = useLocalTracks();
    const playTrack = usePlayerStore((s) => s.playTrack);

    const tracks = data ?? [];

    const handleBrowseFiles = async (currentPath?: string) => {
        const selected = await selectAudio(currentPath);
        if (!selected?.length) return;

        console.log("Выбранные файлы:", selected);
        try {
            alert(`Выбранные файлы: ${selected}`);
            importTracks({ paths: selected });
        } catch (error) {
            console.error("Не удалось создать хранилища:", error);
        }
    };

    const handlePlayTrack = (track: LocalTrackResponse) => {
        const audioPath = track.audio.library.path + "/" + track.audio.path;

        const coverPath = track.cover
            ? convertFileSrc(track.cover.library.path + "/" + track.cover.path)
            : null;

        const waveformPath = track.waveform
            ? track.waveform.library.path + "/" + track.waveform.path
            : null;

        playTrack({
            trackId: String(track.trackId),
            metadataArtist: track.metadataArtist,
            title: track.title,
            audioSrc: audioPath,
            coverSrc: coverPath,
            waveformSrc: waveformPath,
            durationSeconds: track.durationSeconds,
            genre: null,
            likesCount: 0,
        });
    };

    return (
        <>
            <Flex direction="column" gap="lg" size="page-md" container fullWidth>
                <Flex as="header" justify="space-between" align="flex-end" wrap="wrap" gap="md">
                    <h1>{t("offline.title")}</h1>
                    <Flex gap="md">
                        <Button variant="secondary" onClick={() => navigate("/settings/storage")}>
                            Настройки хранилища
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                handleBrowseFiles();
                            }}
                        >
                            {isPending && progress
                                ? `Импорт ${progress.done}/${progress.total}`
                                : "+ Импортировать треки"}
                        </Button>
                    </Flex>
                </Flex>

                <StorageDashboard />

                <section className={styles.controls}>
                    <div className={styles.tabs}>
                        <button
                            className={clsx(styles.tab, {
                                [styles.tabActive]: activeTab === "all",
                            })}
                            onClick={() => setActiveTab("all")}
                        >
                            Все (15)
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === "imported" ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab("imported")}
                        >
                            Импортированные (5)
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === "cache" ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab("cache")}
                        >
                            Кэш (10)
                        </button>
                    </div>

                    <div className={styles.search}>
                        <Input placeholder="Поиск по названию или артисту..." />
                    </div>
                </section>

                <div className={styles.trackList}>
                    <div className={styles.header}>
                        <span className={styles.center}>#</span>
                        <span>Трек</span>
                        <span className={styles.center}>Тип</span>
                        <span className={styles.center}>Вес</span>
                        <span className={styles.center}>Время</span>
                    </div>

                    {tracks.map((track, i) => {
                        const coverPath = track.cover
                            ? track.cover.library.path + "/" + track.cover.path
                            : "";

                        const isLinked = track.cover?.library === null;

                        return (
                            <div
                                key={track.trackId}
                                className={styles.row}
                                onClick={() => handlePlayTrack(track)}
                            >
                                <span className={styles.index}>{i + 1}</span>

                                <div className={styles.track}>
                                    <Cover
                                        alt={track.title}
                                        src={convertFileSrc(coverPath)}
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
                                    {formatTime(track.durationSeconds ?? 0)}
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
                                        }}
                                    >
                                        <Icon name="action-delete" size={13} />
                                    </Button>
                                </Flex>
                            </div>
                        );
                    })}
                </div>
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
