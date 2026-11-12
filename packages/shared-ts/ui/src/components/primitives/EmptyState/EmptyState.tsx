import styles from "./EmptyState.module.scss";
import type { ReactNode } from "react";
import clsx from "clsx";

export interface EmptyStateProps {
    title?: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    action?: ReactNode;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const EmptyState = ({
    title,
    description,
    icon,
    action,
    size = "md",
    className,
}: EmptyStateProps) => (
    <div className={clsx(styles.empty, styles[`empty--${size}`], className)} role="status">
        {icon && <div className={styles.icon}>{icon}</div>}
        {title && <p className={styles.title}>{title}</p>}
        {description && <p className={styles.description}>{description}</p>}
        {action && <div className={styles.action}>{action}</div>}
    </div>
);
