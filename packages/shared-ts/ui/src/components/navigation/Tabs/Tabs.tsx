import styles from "./Tabs.module.scss";
import clsx from "clsx";

type TabVariant = "primary" | "secondary";

export interface TabItem {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface TabsProps {
    tabs?: TabItem[];
    active?: string;
    onTabClick?: (value: string) => void;
    variant?: TabVariant;
    className?: string;
}

export const Tabs = ({
    tabs = [],
    active,
    onTabClick,
    variant = "primary",
    className,
}: TabsProps) => {
    if (!tabs.length) return null;

    return (
        <div role="tablist" className={clsx(styles.tabs, styles[`tabs--${variant}`], className)}>
            {tabs.map((tab) => {
                const isActive = tab.value === active;

                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        disabled={tab.disabled}
                        className={clsx(styles.tab, { [styles["tab--active"]]: isActive })}
                        onClick={() => onTabClick?.(tab.value)}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};
