import styles from "./Sidebar.module.scss";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
    Avatar,
    Button,
    CollapseIcon,
    ExpandIcon,
    Flex,
    LanguageIcon,
    SettingsIcon,
} from "@zelefy/ui";
import { useSettingsStore } from "@/shared/lib/stores";
import { navItems } from "../config";

export const Sidebar = () => {
    const { t, i18n } = useTranslation();
    const isMinified = useSettingsStore((state) => state.isSidebarMinified);
    const toggleSidebar = useSettingsStore((state) => state.toggleSidebar);
    const setLanguage = useSettingsStore((state) => state.setLanguage);

    const handleChangeLanguage = () => {
        const nextLang = i18n.language === "ru" ? "en" : "ru";
        setLanguage(nextLang);
    };

    const getNavClass = ({ isActive }: { isActive: boolean }) =>
        clsx(styles.navButton, {
            [styles["navButton--active"]]: isActive,
        });

    return (
        <Flex
            as="aside"
            direction="column"
            justify="space-between"
            className={clsx(styles.sidebar, { [styles["sidebar--minify"]]: isMinified })}
        >
            <Flex as="nav" direction="column" gap="2xs">
                {navItems.map((item) => (
                    <Button
                        key={item.path}
                        as={NavLink}
                        to={item.path}
                        variant="ghost"
                        size="small"
                        className={getNavClass}
                        title={isMinified ? t(item.label) : undefined}
                        aria-label={t(item.label)}
                    >
                        <item.icon width={22} height={22} />
                        <span>{t(item.label)}</span>
                    </Button>
                ))}
            </Flex>

            <Flex direction="column" gap="2xs">
                <Button
                    variant="ghost"
                    size="small"
                    onClick={toggleSidebar}
                    className={styles.navButton}
                    title={isMinified ? t("sidebar.expand") : undefined}
                    aria-label={isMinified ? t("sidebar.expand") : t("sidebar.collapse")}
                >
                    {isMinified ? (
                        <ExpandIcon width={22} height={22} />
                    ) : (
                        <CollapseIcon width={22} height={22} />
                    )}
                    <span>{t("sidebar.collapse")}</span>
                </Button>

                <Button
                    variant="ghost"
                    size="small"
                    onClick={handleChangeLanguage}
                    className={styles.navButton}
                    title={isMinified ? t("language.current") : undefined}
                    aria-label={t("language.current")}
                >
                    <LanguageIcon width={22} height={22} />
                    <span>{t("language.current")}</span>
                </Button>

                <Button
                    as={NavLink}
                    to="/settings"
                    variant="ghost"
                    size="small"
                    className={getNavClass}
                    title={isMinified ? t("sidebar.settings") : undefined}
                    aria-label={t("sidebar.settings")}
                >
                    <SettingsIcon width={22} height={22} />
                    <span>{t("sidebar.settings")}</span>
                </Button>

                <Button
                    as={NavLink}
                    to="/profile"
                    variant="ghost"
                    size="small"
                    className={getNavClass}
                    title={isMinified ? "Zelefy" : undefined}
                    aria-label={"Zelefy"}
                >
                    <Avatar
                        src="https://avatars.githubusercontent.com/u/192537945?s=400&u=193d7630edda49abaa85c6014c8018b0f0963ae7&v=4"
                        size="xs"
                        name="Zelefy"
                    />
                    <span>Zelefy</span>
                </Button>
            </Flex>
        </Flex>
    );
};
