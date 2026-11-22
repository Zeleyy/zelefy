import styles from "./StorageSettings.module.scss";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import clsx from "clsx";
import { Button, Dropdown, Flex, formatBytes, Icon, Input } from "@zelefy/ui";
import { selectDirectory } from "@/shared/lib/utils";
import { useCacheStore } from "@/shared/lib/stores";
import {
    useCreateLibrary,
    useLibrariesWithStats,
    useSetLibraryPrimary,
    useUpdateLibraryPath,
} from "@/features/storage";
import { SettingsSection } from "@/widgets/sections";

export const StorageSettings = () => {
    const { t } = useTranslation();
    const { data: librariesWithStats } = useLibrariesWithStats();
    const { mutate: createLibrary } = useCreateLibrary();
    const { mutate: updateLibraryPath } = useUpdateLibraryPath();
    const { mutate: setLibraryPrimary } = useSetLibraryPrimary();

    const storages = librariesWithStats ?? [];

    const cacheRoot = useCacheStore((state) => state.cacheRoot);
    const defaultCacheRoot = useCacheStore((state) => state.defaultCacheRoot);
    const setCacheRoot = useCacheStore((state) => state.setCacheRoot);
    const resetCacheRoot = useCacheStore((state) => state.resetCacheRoot);

    const handleBrowseFolder = async (libraryId?: number, currentPath?: string) => {
        const selected = await selectDirectory(currentPath);
        if (!selected) return;

        if (libraryId == null) {
            createLibrary(selected);
        } else {
            updateLibraryPath({ libraryId, path: selected });
        }
    };

    const handleBrowseCacheFolder = async (currentPath: string) => {
        const selected = await selectDirectory(currentPath);
        if (!selected) return;

        const ok = await setCacheRoot(selected);
        if (!ok) toast.error("Ошибка");
    };

    return (
        <>
            <h1>{t("settings.storage.title")}</h1>

            <SettingsSection
                title={t("settings.storage.section.title")}
                description={t("settings.storage.section.description")}
            >
                <div className={styles.storageSettingsList}>
                    {storages.map((library) => {
                        const isPrimaryLibrary = library.isPrimary;

                        return (
                            <div key={library.libraryId} className={styles.storageRow}>
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
                                                {library.path.match(
                                                    /([^\\/]+)[\\/]zelefy-data[\\/]/,
                                                )?.[1] + "\\" || library.path}
                                            </span>
                                        )}
                                    </div>

                                    <span className={styles.metrics}>
                                        <Trans
                                            i18nKey="settings.storage.metrics.tracks_count"
                                            count={library.filesCount}
                                            values={{
                                                size: formatBytes(library.usedSizeBytes),
                                            }}
                                            components={{ strong: <strong /> }}
                                        />
                                    </span>
                                </div>

                                <div className={styles.rowPathControl}>
                                    <Input value={library.path} readOnly />
                                </div>

                                <div className={styles.rowActions}>
                                    <Button
                                        variant="primary"
                                        size="small"
                                        onClick={() =>
                                            void handleBrowseFolder(library.libraryId, library.path)
                                        }
                                    >
                                        {t("settings.storage.actions.browse")}
                                    </Button>

                                    <Dropdown
                                        trigger={
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                square
                                                className={styles.moreMenuBtn}
                                                title={t("settings.storage.actions.options")}
                                            >
                                                <Icon name="common-ellipsis" size={22} />
                                            </Button>
                                        }
                                        items={[
                                            {
                                                label: t("settings.storage.actions.set_primary"),
                                                onClick: () => setLibraryPrimary(library.libraryId),
                                                disabled: isPrimaryLibrary,
                                            },
                                            {
                                                label: t("common.delete"),
                                                onClick: () => console.log("delete"),
                                                disabled: isPrimaryLibrary,
                                                variant: "danger",
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    <div
                        className={clsx(styles.storageRow, styles.storageRowAction)}
                        onClick={() => {
                            void handleBrowseFolder();
                        }}
                    >
                        <div className={styles.actionContent}>
                            <span className={styles.actionIcon}>+</span>
                            <span className={styles.actionText}>
                                {t("settings.storage.actions.add_library_folder")}
                            </span>
                        </div>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection
                title={t("settings.storage.cache.title")}
                actions={
                    <Button
                        variant="secondary"
                        size="small"
                        disabled={cacheRoot === defaultCacheRoot}
                        onClick={() => {
                            void resetCacheRoot();
                        }}
                    >
                        {t("common.reset")}
                    </Button>
                }
            >
                <Flex align="center" gap="xs">
                    <Input value={cacheRoot} readOnly />
                    <Button
                        onClick={() => {
                            void handleBrowseCacheFolder(cacheRoot);
                        }}
                    >
                        {t("settings.storage.actions.browse")}
                    </Button>
                </Flex>
            </SettingsSection>
        </>
    );
};
