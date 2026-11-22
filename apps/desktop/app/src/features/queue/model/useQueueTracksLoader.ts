import { useShallow } from "zustand/react/shallow";
import { useEnsureTracks, usePlayerStore } from "@/features/player";

export const useQueueTracksLoader = () => {
    const ids = usePlayerStore(useShallow((s) => s.queue.map((i) => i.trackId)));
    return useEnsureTracks(ids);
};
