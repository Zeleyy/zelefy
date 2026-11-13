import type { ReactNode } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type CollisionDetection,
    type Modifier,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    type SortingStrategy,
} from "@dnd-kit/sortable";

export type DraggableId = string | number;

interface DraggableListProps<T extends DraggableId> {
    items: T[];
    onReorder: (activeId: T, overId: T) => void;
    children: ReactNode;
    strategy?: SortingStrategy;
    collisionDetection?: CollisionDetection;
    modifiers?: Modifier[];
    disabled?: boolean;
}

export const DraggableList = <T extends DraggableId>({
    items,
    onReorder,
    children,
    strategy = verticalListSortingStrategy,
    collisionDetection = closestCenter,
    modifiers,
    disabled,
}: DraggableListProps<T>) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.indexOf(active.id as T);
        const newIndex = items.indexOf(over.id as T);
        if (oldIndex === -1 || newIndex === -1) return;

        onReorder(active.id as T, over.id as T);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            modifiers={modifiers}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items} strategy={strategy} disabled={disabled}>
                {children}
            </SortableContext>
        </DndContext>
    );
};
