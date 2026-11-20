import styles from "./StorageDashboard.module.scss";
import { useNavigate } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import clsx from "clsx";
import { Flex, formatBytes } from "@zelefy/ui";
import { useLibrariesWithStats } from "@/features/storage";

export const StorageDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: librariesWithStats } = useLibrariesWithStats();

    const libraries = librariesWithStats ?? [];

    const MAX_VISIBLE = libraries.length === 4 ? 4 : 3;
    const visibleLibraries = libraries.slice(0, MAX_VISIBLE);
    const remainingCount = libraries.length - MAX_VISIBLE;
    const totalUsedBytes = libraries.reduce((acc, s) => acc + s.usedSizeBytes, 0);

    return (
        <Flex as={"section"} direction="column" gap="md" className={styles.storageDashboard}>
            <Flex justify="space-between" align="center" className={styles.dashboardHeader}>
                <span className={styles.storageTitle}>{t("offline.storage.title")}</span>
                <div className={styles.totalInfo}>
                    {t("offline.storage.total_used")} <span>{formatBytes(totalUsedBytes, 2)}</span>
                </div>
            </Flex>

            <div className={styles.storageGrid}>
                {visibleLibraries.map((storage) => {
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
                                            ? t("offline.storage.main_library")
                                            : storage.path.split("/").pop() || storage.path}
                                    </span>
                                </span>
                                <span className={styles.cardMetrics}>
                                    {formatBytes(storage.usedSizeBytes)}

                                    <span className={styles.subText}>
                                        <Trans
                                            i18nKey={"offline.storage.tracks_count"}
                                            count={storage.filesCount}
                                        />
                                    </span>
                                </span>
                            </div>

                            <div className={styles.progressBarTrack}>
                                <div
                                    className={clsx({
                                        [styles.progressSegmentImported]: isPrimaryLibrary,
                                        [styles.progressSegmentExternal]: !storage.isPrimary,
                                    })}
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
                                {storage.isPrimary && (
                                    <span className={styles.badgePrimary}>Primary</span>
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
                        onClick={() => void navigate("/settings/storage")}
                    >
                        <span className={styles.moreCount}>+{remainingCount}</span>
                        <span className={styles.moreText}>Ещё хранилища</span>
                    </Flex>
                )}
            </div>
        </Flex>
    );
};
