import styles from "./StorageDashboard.module.scss";
import { useNavigate } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import clsx from "clsx";
import { Button, Flex, formatBytes } from "@zelefy/ui";
import { useLibraries } from "@/features/storage";

// @TODO: переработать после удаления кеша
export const StorageDashboard = () => {
    const { t } = useTranslation();
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
                <span className={styles.storageTitle}>{t("offline.storage.title")}</span>
                <div className={styles.totalInfo}>
                    {t("offline.storage.total_used")} {formatBytes(totalUsedBytes, 2)}
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
