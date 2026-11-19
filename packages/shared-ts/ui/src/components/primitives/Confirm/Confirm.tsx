import styles from "./Confirm.module.scss";
import { useEffect, useState, type ReactNode } from "react";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { Flex } from "../Flex";

export type ConfirmVariant = "default" | "danger";

export interface ConfirmProps {
    open: boolean;
    title: ReactNode;
    description: ReactNode;
    confirmLabel: string;
    cancelLabel: string;
    variant?: ConfirmVariant;
    containerId?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const Confirm = ({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant = "default",
    containerId = "modal-root",
    onConfirm,
    onCancel,
}: ConfirmProps) => {
    const [settled, setSettled] = useState(false);

    useEffect(() => {
        if (open) setSettled(false);
    }, [open]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && !settled) {
            setSettled(true);
            onCancel();
        }
    };

    const handleConfirm = () => {
        if (settled) return;
        setSettled(true);
        onConfirm();
    };

    const handleCancel = () => {
        if (settled) return;
        setSettled(true);
        onCancel();
    };

    return (
        <Modal
            open={open}
            onOpenChange={handleOpenChange}
            title={title}
            containerId={containerId}
            className={styles.popup}
            actions={
                <Flex justify="flex-end" gap="sm">
                    <Button type="button" variant="secondary" onClick={handleCancel}>
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={variant === "danger" ? "secondary" : "primary"}
                        colorScheme={
                            variant === "danger"
                                ? {
                                      bgColor: "var(--danger)",
                                      bgColorHover: "var(--danger-hover)",
                                  }
                                : undefined
                        }
                        onClick={handleConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </Flex>
            }
        >
            {description}
        </Modal>
    );
};
