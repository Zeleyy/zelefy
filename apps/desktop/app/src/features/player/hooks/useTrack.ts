import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { trackKeys, type TrackId } from "@/entities/track";
import type { PlayerTrack } from "@zelefy/types";

export const useTrack = (id: TrackId | undefined) =>
    useQuery<PlayerTrack>({
        queryKey: trackKeys.detail(id ?? ""),
        queryFn: skipToken,
        placeholderData: keepPreviousData,
    });
