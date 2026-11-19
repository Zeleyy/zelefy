import styles from "./SettingsSection.module.scss";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@zelefy/ui";

interface SettingsSectionProps {
    icon?: IconName;
    title: string;
    description?: string;
    children?: ReactNode;
    actions?: ReactNode;
}

export const SettingsSection = ({
    title,
    icon,
    description,
    actions,
    children,
}: SettingsSectionProps) => {
    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div className={styles.heading}>
                    {icon && (
                        <div className={styles.icon}>
                            <Icon name={icon} size={20} />
                        </div>
                    )}

                    <div className={styles.titleText}>
                        <h3 className={styles.title}>{title}</h3>
                        {description && <p className={styles.description}>{description}</p>}
                    </div>
                </div>

                {actions}
            </div>
            <div className={styles.content}>{children}</div>
        </section>
    );
};
