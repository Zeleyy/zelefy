import styles from "./Modal.module.scss";
import { useEffect, useState, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import clsx from "clsx";

export interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: ReactNode;
    children?: ReactNode;
    actions?: ReactNode;
    containerId?: string;
    className?: string;
}

export const Modal = ({
    open,
    onOpenChange,
    title,
    children,
    actions,
    containerId = "modal-root",
    className,
}: ModalProps) => {
    const [container, setContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setContainer(document.getElementById(containerId));
    }, [containerId]);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal container={container ?? undefined}>
                <Dialog.Backdrop className={styles.backdrop} />

                <div className={styles.scroll} data-scrollbar>
                    <Dialog.Popup className={clsx(styles.popup, className)}>
                        {title && <Dialog.Title className={styles.title}>{title}</Dialog.Title>}

                        {children}

                        {actions}
                    </Dialog.Popup>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
