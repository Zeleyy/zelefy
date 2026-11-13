import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { selectCurrentTrackId, usePlayerStore } from "../model";
import { trackQueryOptions } from "@/entities/track";

export const useCurrentTrack = () => {
    const trackId = usePlayerStore(selectCurrentTrackId);

    const { data } = useQuery({
        ...trackQueryOptions(trackId ?? ""),
        enabled: trackId !== undefined,
        placeholderData: keepPreviousData,
    });

    return trackId === undefined ? null : (data ?? null);
};
