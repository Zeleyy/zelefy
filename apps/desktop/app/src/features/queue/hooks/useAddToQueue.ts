import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { PlayerTrack } from "@zelefy/types";
import { usePlayerStore } from "@/features/player";
import { truncateWords } from "@zelefy/ui";

export const useAddToQueue = () => {
    const { t } = useTranslation();
    const addToQueue = usePlayerStore((s) => s.addToQueue);

    return useCallback(
        (track: PlayerTrack) => {
            const res = addToQueue(track.trackId);

            const toastFn = res === "replaced" ? toast.info : toast.success;
            const descKey = res === "replaced" ? "queue.replaced" : "queue.added";

            toastFn(truncateWords(track.title, 38), { description: t(descKey) });
        },
        [t, addToQueue],
    );
};
