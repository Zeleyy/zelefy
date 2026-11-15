import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { queryClient } from "@/shared/api";
import type { JobEvent } from "@/entities/job";
import { toPlayerTrack, trackKeys, type LocalTrackResponse } from "@/entities/track";
import { usePlayerStore } from "@/features/player";
import { useJobsStore } from "../model";

export const useJobsBridge = () => {
    useEffect(() => {
        const { upsert, merge, remove } = useJobsStore.getState();

        const unlistenPromise = listen<JobEvent>("jobs://event", ({ payload }) => {
            upsert(payload);

            if (payload.status === "done" || payload.status === "cancelled") {
                setTimeout(() => remove(payload.jobId), 3000);
            }

            if (
                payload.kind === "waveform" &&
                payload.status === "done" &&
                payload.payload != null
            ) {
                void (async () => {
                    const track = await invoke<LocalTrackResponse>("get_local_track", {
                        trackId: payload.payload.trackId,
                    });

                    usePlayerStore.getState().patchTrack(track.trackId, toPlayerTrack(track));
                    queryClient.invalidateQueries({ queryKey: trackKeys.local() });
                    queryClient.invalidateQueries({ queryKey: ["jobs"] });
                })().catch(toast.error);
            }
        });

        unlistenPromise.then(() =>
            invoke<JobEvent[]>("get_active_jobs").then(merge).catch(toast.error),
        );

        return () => {
            unlistenPromise.then((f) => f());
        };
    }, []);
};
