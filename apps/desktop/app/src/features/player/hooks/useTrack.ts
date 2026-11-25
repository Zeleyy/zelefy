import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import type { PlayerTrack, TrackId } from "@zelefy/types";
import { trackKeys } from "@/entities/track";

export const useTrack = (id: TrackId | undefined) =>
    useQuery<PlayerTrack>({
        queryKey: trackKeys.detail(id ?? ""),
        queryFn: skipToken,
        placeholderData: keepPreviousData,
    });
