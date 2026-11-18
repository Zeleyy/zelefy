import { useCallback, useRef, useState } from "react";

export const useOptimisticOrder = <T>(serverIds: T[]) => {
    const [override, setOverride] = useState<T[] | null>(null);
    const pending = useRef(0);
    const ids = override ?? serverIds;

    const move = useCallback(
        (activeId: T, overId: T) => {
            const from = ids.indexOf(activeId);
            const to = ids.indexOf(overId);
            if (from === -1 || to === -1 || from === to) return;
            const next = [...ids];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            pending.current += 1;
            setOverride(next);
        },
        [ids],
    );

    const settle = useCallback(() => {
        pending.current -= 1;
        if (pending.current === 0) setOverride(null);
    }, []);

    return { ids, move, settle };
};
