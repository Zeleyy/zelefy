import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { toast } from "sonner";
import type { PlayerTrack, TrackId } from "@zelefy/types";
import { queryClient } from "@/shared/api";
import { useSettingsStore } from "@/shared/lib/stores";
import { trackKeys } from "@/entities/track";
import { selectCurrentTrackId, usePlayerStore } from "../model";

type PlayerEvent =
    { type: "position"; seconds: number } | { type: "ended" } | { type: "error"; message: string };

const load = (trackId: TrackId, autoplay: boolean) =>
    invoke("player_load_local", { trackId: trackId, autoplay });

export const usePlayerBridge = () => {
    useEffect(() => {
        let finished = false;

        const restoreTrack = () => {
            const id = selectCurrentTrackId(usePlayerStore.getState());
            if (id !== undefined) {
                finished = false;
                void load(id, false);
            }
        };

        const unlistenPromise = listen<PlayerEvent>("player://event", ({ payload }) => {
            const s = usePlayerStore.getState();

            if (payload.type === "position") {
                s.setCurrentTime(payload.seconds);
            } else if (payload.type === "error") {
                toast.error(payload.message);
            } else if (payload.type === "ended") {
                const prevId = selectCurrentTrackId(s);
                if (prevId === undefined) return;

                if (s.repeatMode === "track") {
                    s.setCurrentTime(0);
                    void load(prevId, true);
                    return;
                }

                s.nextTrack();
                const after = usePlayerStore.getState();
                if (selectCurrentTrackId(after) === prevId) {
                    if (after.isPlaying) {
                        after.setCurrentTime(0);
                        void load(prevId, true);
                    } else {
                        finished = true;
                        const durationMs = queryClient.getQueryData<PlayerTrack>(
                            trackKeys.detail(prevId),
                        )?.durationMs;
                        if (durationMs) after.setCurrentTime(durationMs / 1000);
                    }
                }
            }
        });

        const unsubPlayer = usePlayerStore.subscribe((s, prev) => {
            if (!s._hasHydrated) return;

            const id = selectCurrentTrackId(s);
            const prevId = selectCurrentTrackId(prev);

            if (id !== prevId) {
                finished = false;
                if (id !== undefined) void load(id, s.isPlaying);
                else void invoke("player_stop");
            } else if (s.isPlaying !== prev.isPlaying) {
                if (id === undefined) return;
                if (s.isPlaying && finished) {
                    finished = false;
                    s.setCurrentTime(0);
                    void load(id, true);
                } else {
                    void invoke(s.isPlaying ? "player_play" : "player_pause");
                }
            }
        });

        const unsubHydration = usePlayerStore.subscribe(
            (s) => s._hasHydrated,
            (hydrated) => {
                if (hydrated) restoreTrack();
            },
            { fireImmediately: true },
        );

        const applyVolume = () => {
            const { volume, isMuted } = useSettingsStore.getState();
            const linear = isMuted ? 0 : Math.min(Math.max(volume / 100, 0), 1);
            invoke("player_set_volume", { volume: linear ** 2 }).catch(toast.error);
        };
        applyVolume();
        const unsubSettings = useSettingsStore.subscribe(applyVolume);

        return () => {
            unsubPlayer();
            unsubHydration();
            unsubSettings();
            void unlistenPromise.then((f) => f());
        };
    }, []);
};
