import styles from "./OfflinePage.module.scss";
import { useState } from "react";
import { Button, Cover, Flex, formatBytes, formatTime, Input } from "@zelefy/ui";
import { StorageDashboard } from "./StorageDashboard";

export const OfflinePage = () => {
    const [activeTab, setActiveTab] = useState<"all" | "imported" | "cache">("all");

    return (
        <Flex direction="column" gap="lg">
            <Flex as="header" justify="space-between" align="flex-end" wrap="wrap" gap="md">
                <h1>Офлайн библиотека</h1>
                <Flex gap="md">
                    <Button variant="secondary">Настройки хранилища</Button>
                    <Button variant="primary">+ Импортировать треки</Button>
                </Flex>
            </Flex>

            <StorageDashboard />

            <section className={styles.controls}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === "all" ? styles.tabActive : ""}`}
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
                <div className={styles.listHeader}>
                    <span>#</span>
                    <span>Трек</span>
                    <span>Альбом</span>
                    <span>Тип</span>
                    <span>Вес</span>
                    <span>Время</span>
                    <span></span>
                </div>

                <div className={styles.trackRow}>
                    <span className={styles.index}>1</span>
                    <div className={styles.mainInfo}>
                        <Cover alt="Sansara" size="xs" />
                        <div className={styles.meta}>
                            <span className={styles.title}>Sansara</span>
                            <span className={styles.artist}>Zeleyy</span>
                        </div>
                    </div>
                    <span className={styles.album}>Zeleyy Collection</span>
                    <div className={styles.badgeCell}>
                        <span className={`${styles.badge} ${styles.badgeCache}`}>Кэш</span>
                    </div>
                    <span className={styles.size}>{formatBytes(7_969_177.6)}</span>
                    <span className={styles.duration}>{formatTime(242)}</span>
                    <div className={styles.actionsCell}>
                        <Button variant="ghost" className={styles.iconBtn} title="Удалить">
                            ✕
                        </Button>
                    </div>
                </div>

                <div className={styles.trackRow}>
                    <span className={styles.index}>2</span>
                    <div className={styles.mainInfo}>
                        <Cover alt="In Poor Taste" size="xs" />
                        <div className={styles.meta}>
                            <span className={styles.title}>In Poor Taste</span>
                            <span className={styles.artist}>George_GJD, Kasane Teto</span>
                        </div>
                    </div>
                    <span className={styles.album}>Single</span>
                    <div className={styles.badgeCell}>
                        <span className={`${styles.badge} ${styles.badgeCopied}`}>Файл</span>
                    </div>
                    <span className={styles.size}>{formatBytes(6_291_456)}</span>
                    <span className={styles.duration}>{formatTime(198)}</span>
                    <div className={styles.actionsCell}>
                        <Button variant="ghost" className={styles.iconBtn} title="Удалить">
                            ✕
                        </Button>
                    </div>
                </div>

                <div className={styles.trackRow}>
                    <span className={styles.index}>3</span>
                    <div className={styles.mainInfo}>
                        <Cover alt="Nightcore - Poison" size="xs" />
                        <div className={styles.meta}>
                            <span className={styles.title}>Nightcore - Poison</span>
                            <span className={styles.artist}>NCFan</span>
                        </div>
                    </div>
                    <span className={styles.album}>Downloads</span>
                    <div className={styles.badgeCell}>
                        <span className={`${styles.badge} ${styles.badgeLinked}`}>Ссылка</span>
                    </div>
                    <span className={styles.size}>{formatBytes(4_508_876.8)}</span>
                    <span className={styles.duration}>{formatTime(138)}</span>
                    <div className={styles.actionsCell}>
                        <Button variant="ghost" className={styles.iconBtn} title="Удалить">
                            ✕
                        </Button>
                    </div>
                </div>
            </div>
        </Flex>
    );
};
