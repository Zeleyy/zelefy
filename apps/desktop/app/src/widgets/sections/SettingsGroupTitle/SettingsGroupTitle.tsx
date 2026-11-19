import styles from "./SettingsGroupTitle.module.scss";
import type { ReactNode } from "react";
import { Flex } from "@zelefy/ui";

interface SettingsGroupTitleProps {
    title: string;
    children?: ReactNode;
}

export const SettingsGroupTitle = ({ title, children }: SettingsGroupTitleProps) => {
    return (
        <Flex direction="column" gap="xs">
            <h4 className={styles.title}>{title}</h4>
            {children}
        </Flex>
    );
};
