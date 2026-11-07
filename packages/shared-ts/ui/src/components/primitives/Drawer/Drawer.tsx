import styles from "./Drawer.module.scss";
import { useEffect, useState, type ReactNode } from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import clsx from "clsx";

export interface DrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: ReactNode;
    children?: ReactNode;
    containerId?: string;
    className?: string;
}

export const Drawer = ({
    open,
    onOpenChange,
    title,
    children,
    containerId = "drawer-root",
    className,
}: DrawerProps) => {
    const [container, setContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setContainer(document.getElementById(containerId));
    }, [containerId]);

    return (
        <BaseDrawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="right">
            <BaseDrawer.Portal container={container ?? undefined}>
                <BaseDrawer.Viewport>
                    <BaseDrawer.Backdrop className={styles.backdrop} />
                    <BaseDrawer.Popup className={clsx(styles.popup, className)} data-scrollbar>
                        {title && (
                            <BaseDrawer.Title className={styles.title}>{title}</BaseDrawer.Title>
                        )}
                        {children}
                    </BaseDrawer.Popup>
                </BaseDrawer.Viewport>
            </BaseDrawer.Portal>
        </BaseDrawer.Root>
    );
};
