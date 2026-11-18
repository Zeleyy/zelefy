export const getMoveNeighbors = <T>(
    ids: readonly T[],
    activeId: T,
    overId: T,
): { prev: T | undefined; next: T | undefined } | null => {
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return null;

    const rest = ids.filter((id) => id !== activeId);
    return { prev: rest[newIndex - 1], next: rest[newIndex] };
};
