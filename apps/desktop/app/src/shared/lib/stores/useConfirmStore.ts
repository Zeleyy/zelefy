import { create } from "zustand";

export type ConfirmVariant = "default" | "danger";

export interface ConfirmOptions {
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    variant?: ConfirmVariant;
}

interface ConfirmEntry extends ConfirmOptions {
    id: string;
    resolve: (confirmed: boolean) => void;
}

interface ConfirmStore {
    queue: ConfirmEntry[];
    enqueue: (options: ConfirmOptions) => Promise<boolean>;
    settle: (id: string, confirmed: boolean) => void;
    clearAll: () => void;
}

export const useConfirmStore = create<ConfirmStore>()((set, get) => ({
    queue: [],

    enqueue: (options) =>
        new Promise<boolean>((resolve) => {
            const id = crypto.randomUUID();
            set((s) => ({
                queue: [...s.queue, { ...options, id, resolve }],
            }));
        }),

    settle: (id, confirmed) => {
        const entry = get().queue.find((item) => item.id === id);
        if (!entry) return;

        set((s) => ({
            queue: s.queue.filter((item) => item.id !== id),
        }));
        entry.resolve(confirmed);
    },

    clearAll: () => {
        const current = get().queue;
        set({ queue: [] });
        current.forEach((item) => item.resolve(false));
    },
}));

export const confirm = (options: ConfirmOptions): Promise<boolean> =>
    useConfirmStore.getState().enqueue(options);
