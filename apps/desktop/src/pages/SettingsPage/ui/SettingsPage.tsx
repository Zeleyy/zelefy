import styles from "./SettingsPage.module.scss";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Button, Flex } from "@zelefy/ui";
import { navItems } from "../config";

export const SettingsPage = () => {
    const { t } = useTranslation();

    const getNavClass = ({ isActive }: { isActive: boolean }) =>
        clsx(styles.navButton, {
            [styles["navButton--active"]]: isActive,
        });

    return (
        <Flex direction="column" gap="lg" size="page-md" container fullWidth>
            <Flex gap="lg" align="flex-start">
                <Flex as={"nav"} direction="column" gap="2xs" className={styles.navigation}>
                    {navItems.map((item) => (
                        <Button
                            key={item.path}
                            variant="ghost"
                            as={NavLink}
                            to={item.path}
                            size="small"
                            className={getNavClass}
                            title={t(item.label)}
                            aria-label={t(item.label)}
                        >
                            <item.icon width={22} height={22} />
                            <span>{t(item.label)}</span>
                        </Button>
                    ))}
                </Flex>

                <Flex direction="column" gap="md" fullWidth>
                    <Outlet />
                </Flex>
            </Flex>
        </Flex>
    );
};
