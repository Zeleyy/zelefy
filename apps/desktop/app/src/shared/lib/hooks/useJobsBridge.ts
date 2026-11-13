import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import type { JobEvent } from "@/shared/types";
import { trackKeys, type LocalTrackResponse } from "@/entities/track";
import { useJobsStore } from "../stores";

export const useJobsBridge = () => {
    useEffect(() => {
        const { upsert, merge, remove } = useJobsStore.getState();

        const unlistenPromise = listen<JobEvent>("jobs://event", ({ payload }) => {
            upsert(payload);
            console.log(payload);

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

                    queryClient.invalidateQueries({ queryKey: trackKeys.detail(track.trackId) });
                    queryClient.invalidateQueries({ queryKey: trackKeys.local() });
                    queryClient.invalidateQueries({ queryKey: ["jobs"] });
                })().catch(console.error);
            }
        });

        unlistenPromise.then(() =>
            invoke<JobEvent[]>("get_active_jobs").then(merge).catch(console.error),
        );

        return () => {
            unlistenPromise.then((f) => f());
        };
    }, []);
};
