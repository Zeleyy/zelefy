import styles from "./OfflinePage.module.scss";
import { useState } from "react";
import { Button, Cover, Flex, formatBytes, formatTime, Icon, Input } from "@zelefy/ui";
import { StorageDashboard } from "./StorageDashboard";
import { useNavigate } from "react-router";
import { selectAudio } from "@/shared/lib/utils/browse";
import { useImportTracks, useLocalTracks } from "@/features/track";
import clsx from "clsx";
import { TrackFileType, type LocalTrackResponse } from "@/shared/types";
import { convertFileSrc } from "@tauri-apps/api/core";
import { usePlayerStore } from "@/shared/lib/stores";

export const OfflinePage = () => {
    const [activeTab, setActiveTab] = useState<"all" | "imported" | "cache">("all");
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
        const audioPath =
            track.trackFiles[TrackFileType.audio].library.path +
            "/" +
            track.trackFiles[TrackFileType.audio].path;

        const coverPath =
            track.trackFiles[TrackFileType.cover].library.path +
            "/" +
            track.trackFiles[TrackFileType.cover].path;

        const waveformPath =
            track.trackFiles[TrackFileType.waveform].library.path +
            "/" +
            track.trackFiles[TrackFileType.waveform].path;

        playTrack({
            trackId: String(track.trackId),
            userId: "",
            metadataArtist: track.metadataArtist,
            permalink: track.title,
            title: track.title,
            audioUrl: audioPath,
            coverUrl: convertFileSrc(coverPath),
            waveformUrl: waveformPath,
            durationSeconds: track.durationSeconds,

            genre: null,
            description: null,
            bpm: null,
            keySignature: null,
            createdAt: "",

            playsCount: 0,
            likesCount: 0,
            repostsCount: 0,
            commentsCount: 0,
        });
    };

    return (
        <Flex direction="column" gap="lg" size="page-md" container fullWidth>
            <Flex as="header" justify="space-between" align="flex-end" wrap="wrap" gap="md">
                <h1>Офлайн библиотека</h1>
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
                        className={clsx(styles.tab, { [styles.tabActive]: activeTab === "all" })}
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
                    const coverPath =
                        track.trackFiles[TrackFileType.cover].library.path +
                        "/" +
                        track.trackFiles[TrackFileType.cover].path;

                    const isLinked = track.trackFiles[TrackFileType.cover].library === null;

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
                                    <span className={styles.artist}>{track.metadataArtist}</span>
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
                                {formatBytes(track.trackFiles[TrackFileType.audio].sizeBytes)}
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
                                >
                                    <Icon name="action-save" size={13} />
                                </Button>
                                <Button
                                    variant="outline"
                                    colorScheme={{ color: "var(--danger)" }}
                                    square
                                >
                                    <Icon name="action-delete" size={13} />
                                </Button>
                            </Flex>
                        </div>
                    );
                })}
            </div>
        </Flex>
    );
};
