import { useUpdate } from "@/features/update";
import { Button, Flex, SpinnerLoader } from "@zelefy/ui";
import { useTranslation } from "react-i18next";

export const GeneralSettings = () => {
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
        <>
            <h1>{t("settings.general.title")}</h1>

            <Flex direction="column" gap="sm">
                <Flex justify="space-between" align="center">
                    <span>{t("settings.general.updates.currentVersion")}:</span>
                    <strong>{currentVersion || "..."}</strong>
                </Flex>

                {updateInfo && (
                    <Flex justify="space-between" align="center">
                        <span>{t("settings.general.updates.latestVersion")}:</span>
                        <strong>{hasUpdate ? latestVersion : currentVersion}</strong>
                    </Flex>
                )}

                <div>
                    {!updateInfo && !isChecking && t("settings.general.updates.status.idle")}
                    {isChecking && t("settings.general.updates.status.checking")}
                    {updateInfo && hasUpdate && t("settings.general.updates.status.available")}
                    {updateInfo && !hasUpdate && t("settings.general.updates.status.notAvailable")}
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
            </Flex>
        </>
    );
};
