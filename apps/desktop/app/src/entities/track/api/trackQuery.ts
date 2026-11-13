import { queryOptions } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { PlayerTrack } from "@zelefy/types";
import { toPlayerTrack, type LocalTrackResponse } from "../model";
import { trackKeys } from "./trackKeys";

export type TrackId = string | number;

export const trackQueryOptions = (trackId: TrackId) =>
    queryOptions({
        queryKey: trackKeys.detail(trackId),
        queryFn: async (): Promise<PlayerTrack> => {
            if (typeof trackId === "number") {
                return toPlayerTrack(
                    await invoke<LocalTrackResponse>("get_local_track", { trackId }),
                );
            }
            // TODO: получение с сервера
            throw new Error(`Loading remote track "${trackId}" is not implemented yet`);
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    });
