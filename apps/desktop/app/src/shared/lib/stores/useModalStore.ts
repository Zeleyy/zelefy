import { create } from "zustand";
import type { PlaylistId } from "@/entities/playlist";
import type { TrackId } from "@/entities/track";

export interface ModalPropsMap {
    addToPlaylist: { trackId: TrackId };
    editTrack: { trackId: TrackId };
    editPlaylist: { playlistId: PlaylistId };
}

export type ModalName = keyof ModalPropsMap;

export type ModalComponentProps<K extends ModalName> = ModalPropsMap[K] & {
    onClose: () => void;
};

type ModalEntry = {
    [K in ModalName]: { id: string; name: K; props: ModalPropsMap[K] };
}[ModalName];

type OpenArgs<K extends ModalName> = ModalPropsMap[K] extends undefined
    ? [props?: undefined]
    : [props: ModalPropsMap[K]];

interface ModalStore {
    stack: ModalEntry[];
    openModal: <K extends ModalName>(name: K, ...args: OpenArgs<K>) => string;
    closeCurrentModal: () => void;
    closeModal: (id?: string) => void;
    closeAll: () => void;
}

export const useModalStore = create<ModalStore>()((set) => ({
    stack: [],

    openModal: (name, ...args) => {
        const id = crypto.randomUUID();
        set((s) => ({
            stack: [...s.stack, { id, name, props: args[0] } as ModalEntry],
        }));
        return id;
    },

    closeCurrentModal: () =>
        set((s) => ({
            stack: s.stack.slice(0, -1),
        })),

    closeModal: (id) =>
        set((s) => ({
            stack: id ? s.stack.filter((m) => m.id !== id) : s.stack.slice(0, -1),
        })),

    closeAll: () => set({ stack: [] }),
}));

export const openModal = useModalStore.getState().openModal;
export const closeModal = useModalStore.getState().closeModal;
