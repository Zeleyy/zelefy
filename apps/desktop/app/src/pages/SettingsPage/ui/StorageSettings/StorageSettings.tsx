import styles from "./StorageSettings.module.scss";
import { Trans, useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import clsx from "clsx";
import { Button, Flex, formatBytes, Input } from "@zelefy/ui";
import { useStorages } from "@/features/storage";
import { SettingsSection } from "@/widgets/sections";
import { useCacheStore } from "@/shared/lib/stores";

// const storages = [
//     {
//         storageId: 1,
//         path: "C:/Users/User/AppData/Local/zelefy/cache",
//         isPrimary: false,
//         maxSizeBytes: 2_147_483_648,
//         usedSizeBytes: 734_003_200,
//         filesCount: 42,
//         createdAt: 0,
//     },
//     {
//         storageId: 2,
//         path: "C:/Users/User/Music/zelefy-library",
//         isPrimary: true,
//         maxSizeBytes: null,
//         usedSizeBytes: 326_841_139,
//         filesCount: 15,
//         createdAt: 0,
//     },
//     {
//         storageId: 3,
//         path: "D:/Audio/Archive/asdf/asdfasfd/zelefy-library",
//         isPrimary: false,
//         maxSizeBytes: null,
//         usedSizeBytes: 120_500_100,
//         filesCount: 8,
//         createdAt: 0,
//     },
//     {
//         storageId: 4,
//         path: "E:/Flac_Collection",
//         isPrimary: false,
//         maxSizeBytes: null,
//         usedSizeBytes: 5_368_709_120,
//         filesCount: 120,
//         createdAt: 0,
//     },
//     {
//         storageId: 5,
//         path: "F:/DJ_Sets",
//         isPrimary: false,
//         maxSizeBytes: null,
//         usedSizeBytes: 1_073_741_824,
//         filesCount: 30,
//         createdAt: 0,
//     },
// ];

// @TODO: переработать после удаления кеша
export const StorageSettings = () => {
    const { t } = useTranslation();
    const { data } = useStorages();

    const storages = data ?? [];

    const cacheRoot = useCacheStore((state) => state.cacheRoot);
    const defaultCacheRoot = useCacheStore((state) => state.defaultCacheRoot);
    const setCacheRoot = useCacheStore((state) => state.setCacheRoot);
    const resetCacheRoot = useCacheStore((state) => state.resetCacheRoot);

    const handleBrowseFolder = async (storageId?: number, currentPath?: string) => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                defaultPath: currentPath,
            });

            if (selected && typeof selected === "string") {
                console.log(`Выбран новый путь для хранилища ${storageId}:`, selected);
            }
        } catch (error) {
            console.error("Ошибка при выборе папки:", error);
        }
    };

    const handleBrowseCacheFolder = async (currentPath: string) => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                defaultPath: currentPath,
            });

            if (selected && typeof selected === "string") {
                console.log(`Выбран новый путь для кеша:`, selected);
                const ok = await setCacheRoot(selected);
                if (!ok) {
                    alert("ошибка");
                }
            }
        } catch (error) {
            console.error("Ошибка при выборе папки:", error);
        }
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
                                                [styles.dotExternal]: !storage.isPrimary,
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
                                                {storage.path.split("/").pop() || storage.path}
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
