import styles from "./StorageDashboard.module.scss";
import clsx from "clsx";
import { Button, Flex, formatBytes } from "@zelefy/ui";
import { StorageType, type StorageItem } from "@/shared/types/storages";

const storages: StorageItem[] = [
    {
        storageId: 1,
        path: "C:/Users/User/AppData/Local/zelefy/cache",
        storageType: StorageType.Cache,
        isPrimary: false,
        maxSizeBytes: 2_147_483_648,
        usedSizeBytes: 734_003_200,
        filesCount: 42,
    },
    {
        storageId: 2,
        path: "C:/Users/User/Music/zelefy-library",
        storageType: StorageType.Library,
        isPrimary: true,
        maxSizeBytes: null,
        usedSizeBytes: 326_841_139,
        filesCount: 15,
    },
    {
        storageId: 3,
        path: "D:/Audio/Archive/asdf/asdfasfd/zelefy-library",
        storageType: StorageType.Library,
        isPrimary: false,
        maxSizeBytes: null,
        usedSizeBytes: 120_500_100,
        filesCount: 8,
    },
    {
        storageId: 4,
        path: "E:/Flac_Collection",
        storageType: StorageType.Library,
        isPrimary: false,
        maxSizeBytes: null,
        usedSizeBytes: 5_368_709_120,
        filesCount: 120,
    },
    {
        storageId: 5,
        path: "F:/DJ_Sets",
        storageType: StorageType.Library,
        isPrimary: false,
        maxSizeBytes: null,
        usedSizeBytes: 1_073_741_824,
        filesCount: 30,
    },
];

export const StorageDashboard = () => {
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
                    const isCache = storage.storageType === StorageType.Cache;
                    const isLibrary = storage.storageType === StorageType.Library;
                    const isPrimaryLibrary = isLibrary && storage.isPrimary;

                    const progressWidth =
                        isCache && storage.maxSizeBytes
                            ? Math.min(
                                  100,
                                  Math.round((storage.usedSizeBytes / storage.maxSizeBytes) * 100),
                              )
                            : 100;

                    return (
                        <Flex
                            key={storage.storageId}
                            direction="column"
                            justify="space-between"
                            gap="xs"
                            className={styles.storageCard}
                        >
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle} title={storage.path}>
                                    <span
                                        className={clsx(styles.dot, {
                                            [styles.dotCache]: isCache,
                                            [styles.dotImported]: isPrimaryLibrary,
                                            [styles.dotExternal]: isLibrary && !storage.isPrimary,
                                        })}
                                    />
                                    <span className={styles.titleText}>
                                        {isCache
                                            ? "Кэш стриминга"
                                            : isPrimaryLibrary
                                              ? "Библиотека (Основная)"
                                              : storage.path.split("/").pop() || storage.path}
                                    </span>
                                </span>
                                <span className={styles.cardMetrics}>
                                    {formatBytes(storage.usedSizeBytes)}
                                    {isCache && storage.maxSizeBytes ? (
                                        <span className={styles.subText}>
                                            {" "}
                                            / {formatBytes(storage.maxSizeBytes)}
                                        </span>
                                    ) : (
                                        <span className={styles.subText}>
                                            {" "}
                                            ({storage.filesCount} треков)
                                        </span>
                                    )}
                                </span>
                            </div>

                            <div className={styles.progressBarTrack}>
                                <div
                                    className={clsx({
                                        [styles.progressSegmentCache]: isCache,
                                        [styles.progressSegmentImported]: isPrimaryLibrary,
                                        [styles.progressSegmentExternal]:
                                            isLibrary && !storage.isPrimary,
                                    })}
                                    style={{ width: `${progressWidth}%` }}
                                />
                            </div>

                            <Flex
                                align="center"
                                justify="space-between"
                                className={styles.cardFooter}
                            >
                                {isCache ? (
                                    <>
                                        <span>
                                            Свободно:
                                            {" " +
                                                formatBytes(
                                                    (storage.maxSizeBytes ?? 0) -
                                                        storage.usedSizeBytes,
                                                )}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="small"
                                            noPadding
                                            className={styles.actionBtn}
                                        >
                                            Лимит
                                        </Button>
                                    </>
                                ) : (
                                    <>
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
                                    </>
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
                        onClick={() => {}}
                    >
                        <span className={styles.moreCount}>+{remainingCount}</span>
                        <span className={styles.moreText}>Ещё хранилища</span>
                    </Flex>
                )}
            </div>
        </Flex>
    );
};
