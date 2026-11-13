import styles from "./DragButton.module.scss";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import clsx from "clsx";
import { Icon, type IconName } from "../../Icon";

export interface DragButtonProps {
    listeners?: DraggableSyntheticListeners;
    attributes?: DraggableAttributes;
    icon?: IconName;
    size?: number;
    stopPropagation?: boolean;
    className?: string;
}

export const DragButton = ({
    listeners,
    attributes,
    icon = "action-grip-vertical",
    size = 18,
    stopPropagation = true,
    className,
}: DragButtonProps) => (
    <Icon
        className={clsx(styles.drag, className)}
        {...attributes}
        {...listeners}
        onClick={(e) => {
            if (stopPropagation) e.stopPropagation();
        }}
        name={icon}
        size={size}
    />
);
