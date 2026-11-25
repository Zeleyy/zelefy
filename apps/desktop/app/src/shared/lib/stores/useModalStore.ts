import { create } from "zustand";
import type { TrackId } from "@zelefy/types";
import type { PlaylistId } from "@/entities/playlist";

export interface ModalPropsMap {
    addToPlaylist: { trackId: TrackId };
    editPlaylist: { playlistId: PlaylistId };
    editTrack: { trackId: TrackId };
    importTracks: { paths: string[] };
    addServer: {};
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
    closeModal: (id: string) => void;
    closeTop: () => void;
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

    closeModal: (id) =>
        set((s) => ({
            stack: s.stack.filter((m) => m.id !== id),
        })),

    closeTop: () =>
        set((s) => ({
            stack: s.stack.slice(0, -1),
        })),
    closeAll: () => set({ stack: [] }),
}));

export const openModal = <K extends ModalName>(name: K, ...args: OpenArgs<K>) =>
    useModalStore.getState().openModal(name, ...args);
export const closeModal = useModalStore.getState().closeModal;
