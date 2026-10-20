import styles from "./StorageSettings.module.scss";
import { Trans, useTranslation } from "react-i18next";
import clsx from "clsx";
import { Button, Flex, formatBytes, Input } from "@zelefy/ui";
import { useCreateLibrary, useStorages, useUpdateLibraryPath } from "@/features/storage";
import { SettingsSection } from "@/widgets/sections";
import { useCacheStore } from "@/shared/lib/stores";
import { selectDirectory } from "@/shared/lib/utils";

// @TODO: переработать после удаления кеша
export const StorageSettings = () => {
    const { t } = useTranslation();
    const { data } = useStorages();
    const { mutate: createLibrary } = useCreateLibrary();
    const { mutate: updateLibraryPath } = useUpdateLibraryPath();

    const storages = data ?? [];

    const cacheRoot = useCacheStore((state) => state.cacheRoot);
    const defaultCacheRoot = useCacheStore((state) => state.defaultCacheRoot);
    const setCacheRoot = useCacheStore((state) => state.setCacheRoot);
    const resetCacheRoot = useCacheStore((state) => state.resetCacheRoot);

    const handleBrowseFolder = async (storageId?: number, currentPath?: string) => {
        const selected = await selectDirectory(currentPath);
        if (!selected) return;

        if (storageId == null) {
            createLibrary(selected);
        } else {
            updateLibraryPath({ storageId, path: selected });
        }
    };

    const handleBrowseCacheFolder = async (currentPath: string) => {
        const selected = await selectDirectory(currentPath);
        if (!selected) return;

        console.log("Выбран новый путь для кеша:", selected);
        const ok = await setCacheRoot(selected);
        if (!ok) alert("ошибка");
    };

    return (
        <>
            <h1>{t("settings.storage.title")}</h1>

            <SettingsSection
                title={t("settings.storage.section.title")}
                description={t("settings.storage.section.description")}
            >
                <div className={styles.storageSettingsList}>
                    {storages.map((storage) => {
                        const isPrimaryLibrary = storage.isPrimary;

                        return (
                            <div key={storage.storageId} className={styles.storageRow}>
                                <div className={styles.rowInfo}>
                                    <div className={styles.rowTitleWrapper}>
                                        <span
                                            className={clsx(styles.dot, {
                                                [styles.dotImported]: isPrimaryLibrary,
                                                [styles.dotExternal]: !isPrimaryLibrary,
                                            })}
                                        />
                                        {isPrimaryLibrary ? (
                                            <>
                                                <span className={styles.label}>
                                                    {t("settings.storage.types.library")}
                                                </span>
                                                <span className={styles.badgePrimary}>Primary</span>
                                            </>
                                        ) : (
                                            <span className={styles.label}>
                                                {storage.path.match(
                                                    /([^\\/]+)[\\/]zelefy-data[\\/]/,
                                                )?.[1] + "\\" || storage.path}
                                            </span>
                                        )}
                                    </div>

                                    <span className={styles.metrics}>
                                        {storage.maxSizeBytes ? (
                                            <Trans
                                                i18nKey="settings.storage.metrics.cacheUsage"
                                                values={{
                                                    used: formatBytes(storage.usedSizeBytes, 0),
                                                    max: formatBytes(storage.maxSizeBytes, 0),
                                                }}
                                                components={{ strong: <strong /> }}
                                            />
                                        ) : (
                                            <Trans
                                                i18nKey="settings.storage.metrics.tracksCount"
                                                count={storage.filesCount}
                                                values={{
                                                    size: formatBytes(storage.usedSizeBytes),
                                                }}
                                                components={{ strong: <strong /> }}
                                            />
                                        )}
                                    </span>
                                </div>

                                <div className={styles.rowPathControl}>
                                    <Input value={storage.path} readOnly />
                                </div>

                                <div className={styles.rowActions}>
                                    <Button
                                        variant="primary"
                                        size="small"
                                        onClick={() =>
                                            handleBrowseFolder(storage.storageId, storage.path)
                                        }
                                    >
                                        {t("settings.storage.actions.browse")}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="small"
                                        className={styles.moreMenuBtn}
                                        title={t("settings.storage.actions.options")}
                                    >
                                        •••
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    <div
                        className={clsx(styles.storageRow, styles.storageRowAction)}
                        onClick={() => {
                            handleBrowseFolder();
                        }}
                    >
                        <div className={styles.actionContent}>
                            <span className={styles.actionIcon}>+</span>
                            <span className={styles.actionText}>
                                {t("settings.storage.actions.addLibraryFolder")}
                            </span>
                        </div>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Кеш">
                <Flex align="center" gap="xs">
                    <Input value={cacheRoot} readOnly />
                    <Button
                        onClick={() => {
                            handleBrowseCacheFolder(cacheRoot);
                        }}
                    >
                        {t("settings.storage.actions.browse")}
                    </Button>
                    <Button
                        variant="outline"
                        disabled={cacheRoot === defaultCacheRoot}
                        onClick={() => {
                            resetCacheRoot();
                        }}
                    >
                        {t("common.reset")}
                    </Button>
                </Flex>
            </SettingsSection>
        </>
    );
};
