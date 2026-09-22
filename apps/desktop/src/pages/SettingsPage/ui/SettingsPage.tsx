import { useTranslation } from "react-i18next";
import { Button, Flex, SpinnerLoader } from "@zelefy/ui";
import { useUpdate } from "@/features/update";

export const SettingsPage = () => {
    const { t } = useTranslation();
    const {
        currentVersion,
        latestVersion,
        hasUpdate,
        isChecking,
        isInstalling,
        checkForUpdates,
        installUpdate,
        updateInfo,
    } = useUpdate();

    return (
        <Flex direction="column" gap="lg" size="form-sm" container fullWidth>
            <h2>{t("settings.updates.title")}</h2>

            <Flex direction="column" gap="sm">
                <Flex justify="space-between" align="center">
                    <span>{t("settings.updates.currentVersion")}:</span>
                    <strong>{currentVersion || "..."}</strong>
                </Flex>

                {updateInfo && (
                    <Flex justify="space-between" align="center">
                        <span>{t("settings.updates.latestVersion")}:</span>
                        <strong>{hasUpdate ? latestVersion : currentVersion}</strong>
                    </Flex>
                )}

                <div>
                    {!updateInfo && !isChecking && t("settings.updates.status.idle")}
                    {isChecking && t("settings.updates.status.checking")}
                    {updateInfo && hasUpdate && t("settings.updates.status.available")}
                    {updateInfo && !hasUpdate && t("settings.updates.status.notAvailable")}
                </div>
            </Flex>

            <Flex gap="md" align="center">
                {!hasUpdate ? (
                    <>
                        <Button onClick={checkForUpdates} disabled={isChecking}>
                            {t("settings.updates.actions.check")}
                        </Button>
                        <SpinnerLoader isLoading={isChecking} />
                    </>
                ) : (
                    <>
                        <Button onClick={() => installUpdate()} disabled={isInstalling}>
                            {t("settings.updates.actions.install")}
                        </Button>
                        <SpinnerLoader isLoading={isInstalling} />
                    </>
                )}
            </Flex>
        </Flex>
    );
};
