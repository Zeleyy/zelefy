import { useCallback } from "react";
import { usePlayerStore } from "@/features/player";

export const useTrackPlayback = (isCurrent: boolean, onPlay: () => void | Promise<void>) => {
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const seek = usePlayerStore((s) => s.seek);
    const isPlaying = usePlayerStore((s) => s.isPlaying);

    const toggle = useCallback(() => {
        if (isCurrent) togglePlay();
        else void onPlay();
    }, [isCurrent, togglePlay, onPlay]);

    const seekTo = useCallback(
        async (time: number) => {
            if (!isCurrent) await onPlay();
            seek(time);
        },
        [isCurrent, onPlay, seek],
    );

    return { isActive: isCurrent && isPlaying, toggle, seekTo };
};
