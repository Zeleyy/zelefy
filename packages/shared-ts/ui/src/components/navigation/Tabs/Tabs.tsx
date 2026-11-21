import styles from "./Tabs.module.scss";
import clsx from "clsx";

type TabVariant = "primary" | "secondary";
type TabShape = "segmented" | "underline";
type TabsSize = "sm" | "md";

export interface TabItem<T extends string = string> {
    label: string;
    value: T;
    disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
    tabs?: TabItem<T>[];
    active?: T;
    onTabClick?: (value: T) => void;
    variant?: TabVariant;
    shape?: TabShape;
    size?: TabsSize;
    className?: string;
}

export const Tabs = <T extends string = string>({
    tabs = [],
    active,
    onTabClick,
    variant = "primary",
    shape = "segmented",
    size = "md",
    className,
}: TabsProps<T>) => {
    if (!tabs.length) return null;

    return (
        <div
            role="tablist"
            className={clsx(
                styles.tabs,
                styles[`tabs--${shape}`],
                styles[`tabs--${variant}`],
                styles[`tabs--${size}`],
                className,
            )}
        >
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
