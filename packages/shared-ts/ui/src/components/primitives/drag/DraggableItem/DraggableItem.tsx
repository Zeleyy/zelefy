import { useSortable } from "@dnd-kit/sortable";
import type { CSSProperties, ReactNode } from "react";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";

interface DraggableItemRenderProps {
    setNodeRef: (node: HTMLElement | null) => void;
    style: CSSProperties;
    isDragging: boolean;
    listeners: DraggableSyntheticListeners;
    attributes: DraggableAttributes;
}

interface DraggableItemProps {
    id: string | number;
    children: (props: DraggableItemRenderProps) => ReactNode;
    disabled?: boolean;
}

export const DraggableItem = ({ id, children, disabled }: DraggableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        disabled,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
        position: "relative",
    };

    return children({ setNodeRef, style, isDragging, listeners, attributes });
};
