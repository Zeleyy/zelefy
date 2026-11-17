import { lazy, type ComponentType } from "react";
import type { ModalComponentProps, ModalName } from "@/shared/lib/stores";

type Registry = { [K in ModalName]: ComponentType<ModalComponentProps<K>> };

export const modalRegistry: Registry = {
    addToPlaylist: lazy(async () => {
        const { AddToPlaylistModal } = await import("@/features/playlist");
        return { default: AddToPlaylistModal };
    }),
    editTrack: lazy(async () => {
        const { EditTrackModal } = await import("@/features/player");
        return { default: EditTrackModal };
    }),
};
