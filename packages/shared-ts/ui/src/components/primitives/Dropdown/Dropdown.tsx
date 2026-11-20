import styles from "./Dropdown.module.scss";
import type { ReactElement, ReactNode } from "react";
import { Menu } from "@base-ui/react/menu";
import clsx from "clsx";

export interface DropdownItem {
    id?: string | number;
    label: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "default" | "danger";
}

export interface DropdownProps {
    trigger: ReactElement;
    items?: DropdownItem[];
    children?: ReactNode;
}

export const Dropdown = ({ trigger, items = [], children }: DropdownProps) => {
    return (
        <Menu.Root>
            <Menu.Trigger render={trigger} />
            <Menu.Portal>
                <Menu.Positioner sideOffset={4}>
                    <Menu.Popup className={styles.popup}>
                        {items.map((item, index) => (
                            <Menu.Item
                                key={item.id ?? index}
                                className={clsx(styles.item, {
                                    [styles["item--disabled"]]: item.disabled,
                                    [styles[`item--${item.variant ?? "default"}`]]:
                                        item.variant && item.variant !== "default",
                                })}
                                onClick={item.onClick}
                                disabled={item.disabled}
                            >
                                {item.label}
                            </Menu.Item>
                        ))}

                        {children}
                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
    );
};
