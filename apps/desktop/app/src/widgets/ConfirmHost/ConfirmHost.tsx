import { Confirm } from "@zelefy/ui";
import { useConfirmStore } from "@/shared/lib/stores";

export const ConfirmHost = () => {
    const queue = useConfirmStore((s) => s.queue);
    const settle = useConfirmStore((s) => s.settle);

    const current = queue[queue.length - 1];
    if (!current) return null;

    return (
        <Confirm
            key={current.id}
            open
            title={current.title}
            description={current.description}
            confirmLabel={current.confirmLabel}
            cancelLabel={current.cancelLabel}
            variant={current.variant}
            onConfirm={() => settle(current.id, true)}
            onCancel={() => settle(current.id, false)}
        />
    );
};
