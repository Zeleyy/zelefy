import styles from "./NetworkSettings.module.scss";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import clsx from "clsx";
import { Button, Flex, Select } from "@zelefy/ui";
import { confirm, useModalStore } from "@/shared/lib/stores";
import {
    useActiveServer,
    useDefaultServerUrl,
    useResetServer,
    useServers,
    useSwitchServer,
} from "@/entities/server";
import { SettingsSection } from "@/widgets/sections";
import { useServices, useEndpoints } from "../../model";

export const NetworkSettings = () => {
    const { t } = useTranslation();
    const [params, setParams] = useSearchParams();
    const openModal = useModalStore((s) => s.openModal);

    const active = useActiveServer();
    const servers = useServers();
    const defaultUrl = useDefaultServerUrl();
    const switchServer = useSwitchServer();
    const { mutateAsync: resetServer } = useResetServer();

    const options = useMemo(
        () =>
            servers.data?.map((s) => ({
                label: `${s.serverName} (${s.serverUrl})`,
                value: s.serverId,
            })) ?? [],
        [servers],
    );

    const currentUrl = active.data?.serverUrl ?? "";
    const defaultUrlValue = defaultUrl.data ?? "";

    const isDefault = currentUrl === defaultUrlValue;

    const handleSwitch = useCallback(
        async (serverId: number) => {
            const ok = await confirm({
                title: t("settings.network.servers.switch.title"),
                description: t("settings.network.servers.switch.description"),
                confirmLabel: t("settings.network.servers.switch.confirm"),
                cancelLabel: t("common.cancel"),
            });
            if (!ok) return;
            await switchServer.mutateAsync(serverId);
        },
        [t, switchServer],
    );

    const handleReset = useCallback(async () => {
        const ok = await confirm({
            title: t("settings.network.servers.reset.title"),
            description: t("settings.network.servers.reset.description"),
            confirmLabel: t("settings.network.servers.reset.confirm"),
            cancelLabel: t("common.cancel"),
        });
        if (!ok) return;
        await resetServer();
    }, [t, resetServer]);

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
                icon="common-cloud"
                title={t("settings.network.servers.title")}
                description={t("settings.network.servers.description")}
                actions={
                    <Button
                        variant="secondary"
                        onClick={() => void handleReset()}
                        disabled={isDefault}
                        size="small"
                    >
                        {t("common.reset")}
                    </Button>
                }
            >
                <Flex align="center" gap="xs">
                    <Select
                        options={options}
                        value={active.data?.serverId}
                        onChange={(value) => void handleSwitch(value)}
                    />

                    <Button onClick={() => openModal("addServer", {})}>{t("common.add")}</Button>
                </Flex>
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
