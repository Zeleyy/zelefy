import { lazy, type ComponentType } from "react";
import type { ModalComponentProps, ModalName } from "@/shared/lib/stores";

type Registry = { [K in ModalName]: ComponentType<ModalComponentProps<K>> };

export const modalRegistry: Registry = {
    addToPlaylist: lazy(() => import("@/features/playlist/ui/AddToPlaylistModal")),
    editTrack: lazy(() => import("@/features/player/ui/EditTrackModal")),
    editPlaylist: lazy(() => import("@/features/playlist/ui/EdtiPlaylistModal")),
    importTracks: lazy(() => import("@/features/storage/ui/ImportTracksModal")),
    addServer: lazy(() => import("@/entities/server/ui/AddServerModal")),
};
