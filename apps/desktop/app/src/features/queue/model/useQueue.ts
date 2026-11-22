import { usePlayerStore } from "@/features/player";
import { useQueueTracksLoader } from "./useQueueTracksLoader";

export const useQueue = () => {
    const queue = usePlayerStore((s) => s.queue);
    const { isFetching } = useQueueTracksLoader();
    return { queue, isLoading: isFetching };
};
