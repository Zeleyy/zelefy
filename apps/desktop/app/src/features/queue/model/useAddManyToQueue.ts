import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { TrackId } from "@zelefy/types";
import { truncateWords } from "@zelefy/ui";
import type { Playlist } from "@/entities/playlist";
import { usePlayerStore } from "@/features/player";

export const useAddManyToQueue = () => {
    const { t } = useTranslation();
    const addManyToQueue = usePlayerStore((s) => s.addManyToQueue);

    return useCallback(
        (trackIds: TrackId[], playlist: Playlist) => {
            const res = addManyToQueue(trackIds, playlist.playlistId);

            if (res.added === 0) return;

            const descKey = res.dropped > 0 ? "queue.replaced" : "queue.added";
            const toastFn = res.dropped > 0 ? toast.info : toast.success;

            toastFn(
                t("queue.added_many", {
                    count: res.added,
                    playlist: truncateWords(playlist.title, 28),
                }),
                { description: t(descKey) },
            );
        },
        [t, addManyToQueue],
    );
};
