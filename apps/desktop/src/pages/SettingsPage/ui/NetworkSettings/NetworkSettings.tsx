import styles from "./NetworkSettings.module.scss";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { Button, Flex, Input } from "@zelefy/ui";
import { useServices, useEndpoints } from "../../hooks";
import { SettingsSection } from "@/widgets/sections";
import { useSettingsStore } from "@/shared/lib/stores";

// @TODO: Add validation on gateway url
export const NetworkSettings = () => {
    const { t } = useTranslation();
    const [params, setParams] = useSearchParams();

    const gatewayUrl = useSettingsStore((state) => state.gatewayUrl);
    const defaultGatewayUrl = useSettingsStore((state) => state.defaultGatewayUrl);
    const setGatewayUrl = useSettingsStore((state) => state.setGatewayUrl);
    const resetGatewayUrl = useSettingsStore((state) => state.resetGatewayUrl);
    const [draft, setDraft] = useState<string | null>(null);
    const localGatewayUrl = draft ?? gatewayUrl;

    const isDirty = localGatewayUrl !== gatewayUrl;
    const isDefault = gatewayUrl === defaultGatewayUrl;

    const handleSave = async () => {
        await setGatewayUrl(localGatewayUrl);
        setDraft(null);
    };

    const handleReset = async () => {
        await resetGatewayUrl();
        setDraft(null);
    };

    const {
        data: services = [],
        isLoading: isServicesLoading,
        error: servicesError,
    } = useServices();

    const activeService = params.get("service") ?? services[0] ?? "";

    const { data: endpoints = [], isLoading: isEndpointsLoading } = useEndpoints(activeService);

    const selectService = (service: string) => {
        setParams((prev) => {
            prev.set("service", service);
            return prev;
        });
    };

    if (servicesError) {
        return <div className={styles.error}>{t("settings.network.error")}</div>;
    }

    return (
        <>
            <h1>{t("settings.network.title")}</h1>

            <SettingsSection
                title={t("settings.network.connection.title")}
                description={t("settings.network.connection.description")}
            >
                <Flex align="center" gap="xs">
                    <Input
                        key={gatewayUrl}
                        defaultValue={gatewayUrl}
                        placeholder={defaultGatewayUrl}
                        onChange={(e) => setDraft(e.target.value)}
                        inputSize="md"
                    />

                    <Button variant="outline" onClick={handleReset} disabled={isDefault}>
                        {t("common.reset")}
                    </Button>

                    {isDirty && (
                        <Button variant="primary" onClick={handleSave}>
                            {t("common.save")}
                        </Button>
                    )}
                </Flex>

                {!isDefault && defaultGatewayUrl && (
                    <p>
                        {t("settings.network.connection.defaultHint", { url: defaultGatewayUrl })}
                    </p>
                )}
            </SettingsSection>

            <SettingsSection
                title={t("settings.network.services.title")}
                description={t("settings.network.services.description")}
            >
                <div className={styles.tabs} role="tablist">
                    {isServicesLoading ? (
                        <div className={styles.loaderPlaceholder}>{t("common.loading")}</div>
                    ) : (
                        services.map((s) => {
                            const isActive = s === activeService;
                            return (
                                <Button
                                    key={s}
                                    variant="ghost"
                                    radius="none"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => selectService(s)}
                                    className={clsx(styles.tab, {
                                        [styles["tab--active"]]: isActive,
                                    })}
                                >
                                    {s}
                                </Button>
                            );
                        })
                    )}
                </div>

                <Flex direction="column" gap="3xs" fullWidth className={styles.content}>
                    {isEndpointsLoading ? (
                        <div className={styles.loaderPlaceholder}>{t("common.loading")}</div>
                    ) : endpoints.length === 0 ? (
                        <div className={styles.empty}>{t("settings.network.services.empty")}</div>
                    ) : (
                        endpoints.map((ep) => {
                            const methodKey = ep.method?.toLowerCase() ?? "unknown";
                            return (
                                <div key={`${ep.method}-${ep.path}`} className={styles.endpoint}>
                                    <span
                                        className={clsx(
                                            styles.endpoint__method,
                                            styles[`endpoint__method--${methodKey}`],
                                        )}
                                    >
                                        {ep.method}
                                    </span>
                                    <span className={styles.endpoint__path} title={ep.path}>
                                        {ep.path}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </Flex>
            </SettingsSection>
        </>
    );
};
