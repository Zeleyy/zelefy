import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { PlayerTrack } from "@zelefy/types";
import { usePlayerStore, useSettingsStore } from "@/shared/lib/stores";

type PlayerEvent =
    { type: "position"; seconds: number } | { type: "ended" } | { type: "error"; message: string };

const load = (trackId: PlayerTrack["trackId"], autoplay: boolean) =>
    invoke("player_load_local", { trackId: trackId, autoplay });

export const usePlayerBridge = () => {
    useEffect(() => {
        let finished = false;

        const restoreTrack = () => {
            const { currentTrack } = usePlayerStore.getState();
            if (currentTrack) {
                finished = false;
                load(currentTrack.trackId, false);
            }
        };

        const unlistenPromise = listen<PlayerEvent>("player://event", ({ payload }) => {
            const s = usePlayerStore.getState();

            if (payload.type === "position") {
                s.setCurrentTime(payload.seconds);
            } else if (payload.type === "error") {
                console.error("[player]", payload.message);
            } else if (payload.type === "ended") {
                const prev = s.currentTrack;
                if (!prev) return;

                if (s.repeatMode === "track") {
                    s.setCurrentTime(0);
                    load(prev.trackId, true);
                    return;
                }

                s.nextTrack();
                const after = usePlayerStore.getState();
                if (after.currentTrack?.trackId === prev.trackId) {
                    if (after.isPlaying) {
                        after.setCurrentTime(0);
                        load(prev.trackId, true);
                    } else {
                        finished = true;
                        after.setCurrentTime(prev.durationMs / 1000);
                    }
                }
            }
        });

        const unsubPlayer = usePlayerStore.subscribe((s, prev) => {
            if (!s._hasHydrated) return;

            const id = s.currentTrack?.trackId;

            if (id !== prev.currentTrack?.trackId) {
                finished = false;
                if (id !== undefined) load(id, s.isPlaying);
                else invoke("player_stop");
            } else if (s.isPlaying !== prev.isPlaying) {
                if (id === undefined) return;
                if (s.isPlaying && finished && id !== undefined) {
                    finished = false;
                    s.setCurrentTime(0);
                    load(id, true);
                } else {
                    invoke(s.isPlaying ? "player_play" : "player_pause");
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
            invoke("player_set_volume", { volume: linear ** 2 }).catch(console.error);
        };
        applyVolume();
        const unsubSettings = useSettingsStore.subscribe(applyVolume);

        return () => {
            unsubPlayer();
            unsubHydration();
            unsubSettings();
            unlistenPromise.then((f) => f());
        };
    }, []);
};
