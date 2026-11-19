import styles from "./GeneralSettings.module.scss";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Button, Flex, Icon, Select, SpinnerLoader, type Option } from "@zelefy/ui";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/shared/config/i18n";
import { useUpdate } from "@/features/update";
import { SettingsSection } from "@/widgets/sections";
import { useSettingsStore } from "@/shared/lib/stores";

const languages: Option[] = SUPPORTED_LANGUAGES.map((lang) => ({
    label: LANGUAGE_LABELS[lang],
    value: lang,
}));

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
            {/* 
            <Flex direction="column" gap="sm">
                <Flex justify="space-between" align="center">
                    <span>{t("settings.general.updates.current_version")}:</span>
                    <strong>{currentVersion || "..."}</strong>
                </Flex>

                {updateInfo && (
                    <Flex justify="space-between" align="center">
                        <span>{t("settings.general.updates.latest_version")}:</span>
                        <strong>{hasUpdate ? latestVersion : currentVersion}</strong>
                    </Flex>
                )}

                <div>
                    {!updateInfo && !isChecking && t("settings.general.updates.status.idle")}
                    {isChecking && t("settings.general.updates.status.checking")}
                    {updateInfo && hasUpdate && t("settings.general.updates.status.available")}
                    {updateInfo && !hasUpdate && t("settings.general.updates.status.not_available")}
                </div>
            </Flex>
            <Flex gap="md" align="center">
                {!hasUpdate ? (
                    <>
                        <Button onClick={checkForUpdates} disabled={isChecking}>
                            {t("settings.general.updates.actions.check")}
                        </Button>
                        <SpinnerLoader isLoading={isChecking} />
                    </>
                ) : (
                    <>
                        <Button onClick={() => installUpdate()} disabled={isInstalling}>
                            {t("settings.general.updates.actions.install")}
                        </Button>
                        <SpinnerLoader isLoading={isInstalling} />
                    </>
                )}
            </Flex> */}
        </>
    );
};
