import styles from "./SettingsPage.module.scss";
import { NavLink, useLocation, useOutlet } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Button, Flex, Icon } from "@zelefy/ui";
import { navItems } from "../config";
import { cloneElement } from "react";

const variants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

export const SettingsPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const element = useOutlet();

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
                            <Icon name={item.icon} width={22} height={22} />
                            <span>{t(item.label)}</span>
                        </Button>
                    ))}
                </Flex>

                <AnimatePresence mode="wait">
                    {element && (
                        <motion.div
                            key={location.pathname}
                            variants={variants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className={styles.content}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            {cloneElement(element, { key: location.pathname })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Flex>
        </Flex>
    );
};
