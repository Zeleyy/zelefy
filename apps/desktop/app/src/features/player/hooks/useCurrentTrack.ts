import { selectCurrentTrackId, usePlayerStore } from "../model";
import { useTrack } from "./useTrack";

export const useCurrentTrack = () => {
    const trackId = usePlayerStore(selectCurrentTrackId);
    const { data } = useTrack(trackId);
    return trackId === undefined ? null : (data ?? null);
};
