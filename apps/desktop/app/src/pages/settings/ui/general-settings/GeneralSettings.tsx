import styles from "./GeneralSettings.module.scss";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { openUrl } from "@tauri-apps/plugin-opener";
// import { toast } from "sonner";
import clsx from "clsx";
import { Button, Flex, Icon, Select, SpinnerLoader, type Option } from "@zelefy/ui";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/shared/config";
import { useUpdate } from "@/features/update";
import { SettingsSection } from "@/widgets/sections";
import { useSettingsStore } from "@/shared/lib/stores";

const languages: Option[] = SUPPORTED_LANGUAGES.map((lang) => ({
    label: LANGUAGE_LABELS[lang],
    value: lang,
}));

const GITHUB_URL = "https://github.com/zeleyy/zelefy";

export const GeneralSettings = () => {
    const { t } = useTranslation();
    const setLanguage = useSettingsStore((s) => s.setLanguage);
    const language = useSettingsStore((s) => s.language);
    const {
        currentVersion,
        latestVersion,
        hasUpdate,
        isChecking,
        isInstalling,
        checkForUpdates,
        installUpdate,
    } = useUpdate();

    // const handleOpen = async (url: string) => {
    //     try {
    //         await openUrl(url);
    //     } catch (error) {
    //         toast.error(`Не удалось открыть ссылку: ${url}`);
    //     }
    // };

    const links = useMemo(
        () => [
            {
                url: GITHUB_URL,
                title: t("settings.general.about.github.title"),
                description: t("settings.general.about.github.description", { url: GITHUB_URL }),
            },
        ],
        [t],
    );

    return (
        <>
            <h1>{t("settings.general.title")}</h1>

            <SettingsSection icon="common-globe" title={t("settings.general.language.title")}>
                <Select
                    options={languages}
                    value={language}
                    onChange={(value) => setLanguage(value)}
                />
            </SettingsSection>

            <SettingsSection
                icon="action-refresh"
                title={t("settings.general.updates.title")}
                actions={
                    <Flex align="center" gap="xs">
                        <SpinnerLoader isLoading={isChecking} size="xs" />
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={checkForUpdates}
                            disabled={isChecking}
                        >
                            {t("settings.general.updates.action.check")}
                        </Button>
                    </Flex>
                }
            >
                <Flex direction="column" gap="xs" className={styles.versionInfo}>
                    <span className={styles.appName}>zelefy desktop</span>
                    <span className={styles.version}>v{currentVersion}</span>
                </Flex>

                <Flex justify="space-between" gap="md" align="center">
                    <Flex gap="xs" align="center">
                        <Icon
                            name={
                                isChecking
                                    ? "action-refresh"
                                    : hasUpdate
                                      ? "common-sparkles"
                                      : "common-check"
                            }
                            className={styles.icon}
                            size={16}
                        />
                        <span>
                            {t(
                                isChecking
                                    ? "settings.general.updates.status.checking"
                                    : hasUpdate
                                      ? "settings.general.updates.status.available"
                                      : "settings.general.updates.status.not_available",
                                { version: latestVersion },
                            )}
                        </span>
                    </Flex>

                    <Button
                        size="small"
                        onClick={() => installUpdate()}
                        disabled={isInstalling}
                        className={clsx(styles.updateButton, {
                            [styles["updateButton--active"]]: hasUpdate,
                        })}
                    >
                        {t("common.update")}
                    </Button>
                </Flex>
            </SettingsSection>

            <SettingsSection icon="common-info" title={t("settings.general.about.title")}>
                <div className={styles.links}>
                    {links.map((l) => (
                        <Flex
                            key={l.url}
                            align="center"
                            justify="space-between"
                            gap="sm"
                            className={styles.link}
                            onClick={() => void openUrl(l.url)}
                        >
                            <Flex gap="sm" align="center">
                                <div className={styles.link__icon}>
                                    <Icon name="common-link" size={20} />
                                </div>

                                <Flex direction="column" gap="xs" className={styles.link__meta}>
                                    <span className={styles.link__title}>{l.title}</span>
                                    <span className={styles.link__desc}>{l.description}</span>
                                </Flex>
                            </Flex>

                            <Icon name="common-link" size={18} />
                        </Flex>
                    ))}
                </div>
            </SettingsSection>
        </>
    );
};
