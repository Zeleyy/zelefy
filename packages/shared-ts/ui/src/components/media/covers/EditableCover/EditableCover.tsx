import styles from "./EditableCover.module.scss";
import type { ReactNode } from "react";
import { Cover, type CoverProps } from "../Cover";
import { Button } from "../../../primitives";
import clsx from "clsx";

export interface EditableCoverProps extends CoverProps {
    action?: ReactNode;
    onEditClick?: () => void;
}

export const EditableCover = ({ action, onEditClick, className, ...rest }: EditableCoverProps) => (
    <Cover className={clsx(styles.cover, className)} {...rest}>
        <div className={styles.overlay}>
            <Button variant="secondary" type="button" onClick={onEditClick}>
                {action}
            </Button>
        </div>
    </Cover>
);
