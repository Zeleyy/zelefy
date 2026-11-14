import { invoke } from "@tauri-apps/api/core";
import type { PlayerTrack } from "@zelefy/types";
import { toPlayerTrack, type LocalTrackResponse } from "../model";

export const fetchLocalTracks = async (trackIds: number[]): Promise<PlayerTrack[]> => {
    const response = await invoke<LocalTrackResponse[]>("get_local_tracks_by_ids", { trackIds });
    return response.map(toPlayerTrack);
};

export const fetchServerTracks = async (trackIds: string[]): Promise<PlayerTrack[]> => {
    throw new Error(`Loading remote tracks "${trackIds}" is not implemented yet`);
};
