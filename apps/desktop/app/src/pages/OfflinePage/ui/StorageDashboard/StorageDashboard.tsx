import styles from "./StorageDashboard.module.scss";
import { useNavigate } from "react-router";
import clsx from "clsx";
import { Button, Flex, formatBytes } from "@zelefy/ui";
import { useLibraries } from "@/features/storage";

// const _storages: StorageWithStats[] = [
//     {
//         libraryId: 1,
//         path: "C:/Users/User/AppData/Local/zelefy/cache",
//         isPrimary: false,
//         maxSizeBytes: 2_147_483_648,
//         usedSizeBytes: 734_003_200,
//         filesCount: 42,
//         createdAt: 0,
//     },
//     {
//         libraryId: 2,
//         path: "C:/Users/User/Music/zelefy-library",
//         isPrimary: true,
//         maxSizeBytes: null,
//         usedSizeBytes: 326_841_139,
//         filesCount: 15,
//         createdAt: 0,
//     },
//     {
//         libraryId: 3,
//         path: "D:/Audio/Archive/asdf/asdfasfd/zelefy-library",
//         isPrimary: false,
//         maxSizeBytes: null,
//         usedSizeBytes: 120_500_100,
//         filesCount: 8,
//         createdAt: 0,
//     },
//     {
//         libraryId: 4,
//         path: "E:/Flac_Collection",
//         isPrimary: false,
//         maxSizeBytes: null,
//         usedSizeBytes: 5_368_709_120,
//         filesCount: 120,
//         createdAt: 0,
//     },
//     {
//         libraryId: 5,
//         path: "F:/DJ_Sets",
//         isPrimary: false,
//         maxSizeBytes: null,
//         usedSizeBytes: 1_073_741_824,
//         filesCount: 30,
//         createdAt: 0,
//     },
// ];

// @TODO: переработать после удаления кеша
export const StorageDashboard = () => {
    const navigate = useNavigate();
    const { data } = useLibraries();

    const storages = data ?? [];

    const MAX_VISIBLE = storages.length === 4 ? 4 : 3;
    const visibleStorages = storages.slice(0, MAX_VISIBLE);
    const remainingCount = storages.length - MAX_VISIBLE;
    const totalUsedBytes = storages.reduce((acc, s) => acc + s.usedSizeBytes, 0);

    return (
        <Flex as={"section"} direction="column" gap="md" className={styles.storageDashboard}>
            <Flex justify="space-between" align="center" className={styles.dashboardHeader}>
                <span className={styles.storageTitle}>Хранилище приложения</span>
                <div className={styles.totalInfo}>
                    Всего занято: <strong>{formatBytes(totalUsedBytes, 2)}</strong>
                </div>
            </Flex>

            <div className={styles.storageGrid}>
                {visibleStorages.map((storage) => {
                    const isPrimaryLibrary = storage.isPrimary;

                    return (
                        <Flex
                            key={storage.libraryId}
                            direction="column"
                            justify="space-between"
                            gap="xs"
                            className={styles.storageCard}
                        >
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle} title={storage.path}>
                                    <span
                                        className={clsx(styles.dot, {
                                            [styles.dotImported]: isPrimaryLibrary,
                                            [styles.dotExternal]: !storage.isPrimary,
                                        })}
                                    />
                                    <span className={styles.titleText}>
                                        {isPrimaryLibrary
                                            ? "Библиотека (Основная)"
                                            : storage.path.split("/").pop() || storage.path}
                                    </span>
                                </span>
                                <span className={styles.cardMetrics}>
                                    {formatBytes(storage.usedSizeBytes)}

                                    <span className={styles.subText}>
                                        {" "}
                                        ({storage.filesCount} треков)
                                    </span>
                                </span>
                            </div>

                            <div className={styles.progressBarTrack}>
                                <div
                                    className={clsx({
                                        [styles.progressSegmentImported]: isPrimaryLibrary,
                                        [styles.progressSegmentExternal]: !storage.isPrimary,
                                    })}
                                    // style={{ width: `${progressWidth}%` }}
                                />
                            </div>

                            <Flex
                                align="center"
                                justify="space-between"
                                className={styles.cardFooter}
                            >
                                <span className={styles.pathText} title={storage.path}>
                                    {storage.path}
                                </span>
                                {storage.isPrimary ? (
                                    <span className={styles.badgePrimary}>Primary</span>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="small"
                                        noPadding
                                        className={styles.actionBtn}
                                    >
                                        Отключить
                                    </Button>
                                )}
                            </Flex>
                        </Flex>
                    );
                })}

                {remainingCount > 0 && (
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        gap="2xs"
                        className={`${styles.storageCard} ${styles.moreCard}`}
                        onClick={() => navigate("/settings/storage")}
                    >
                        <span className={styles.moreCount}>+{remainingCount}</span>
                        <span className={styles.moreText}>Ещё хранилища</span>
                    </Flex>
                )}
            </div>
        </Flex>
    );
};
