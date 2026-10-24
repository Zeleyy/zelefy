import styles from "./OfflinePage.module.scss";
import { useState } from "react";
import { Button, Cover, Flex, formatBytes, formatTime, Icon, Input } from "@zelefy/ui";
import { StorageDashboard } from "./StorageDashboard";
import { useNavigate } from "react-router";
import { selectAudio } from "@/shared/lib/utils/browse";
import { useImportTracks, useLocalTracks } from "@/features/track";
import clsx from "clsx";

// const tracks = [
//     {
//         id: 1,
//         title: "Sansara",
//         artist: "Zeleyy",
//         type: "Cache",
//         typeLetter: "C",
//         size: 7_969_177.6,
//         duration: 242,
//     },
//     {
//         id: 2,
//         title: "In Poor Taste",
//         artist: "George_GJD, Kasane Teto",
//         type: "Copied",
//         typeLetter: "F",
//         size: 6_291_456,
//         duration: 198,
//     },
//     {
//         id: 3,
//         title: "Nightcore - Poison",
//         artist: "NCFan",
//         type: "Linked",
//         typeLetter: "L",
//         size: 4_508_876.8,
//         duration: 138,
//     },
// ];

export const OfflinePage = () => {
    const [activeTab, setActiveTab] = useState<"all" | "imported" | "cache">("all");
    const navigate = useNavigate();
    const { mutate: importTracks, isPending, progress } = useImportTracks();
    const { data } = useLocalTracks();

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

                {tracks.map((track, i) => (
                    <div key={track.trackId} className={styles.row}>
                        <span className={styles.index}>{i + 1}</span>

                        <div className={styles.track}>
                            <Cover alt={track.permalink} size="xs" />
                            <div className={styles.info}>
                                <span className={styles.title}>{track.title}</span>
                                <span className={styles.artist}>{track.metadataArtist}</span>
                            </div>
                        </div>

                        <div className={styles.type}>
                            <span
                                className={clsx(
                                    styles.badge,
                                    // styles[`badge${track.type}`]
                                    styles.badgeCopied,
                                )}
                            >
                                {/* {track.typeLetter} */}F
                            </span>
                        </div>

                        <span className={clsx(styles.center, styles.size)}>
                            {formatBytes(track.fileSizeBytes)}
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
                ))}
            </div>
        </Flex>
    );
};
