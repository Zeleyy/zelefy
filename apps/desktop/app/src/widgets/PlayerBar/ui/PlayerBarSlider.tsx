import { usePlayerStore } from "@/features/player";
import type { PlayerTrack } from "@zelefy/types";
import { Flex, formatTime, Slider, useSeekProgress } from "@zelefy/ui";

interface PlayerBarSliderProps {
    track: PlayerTrack | null;
}

export const PlayerBarSlider = ({ track }: PlayerBarSliderProps) => {
    const currentTime = usePlayerStore((state) => state.currentTime);
    const seek = usePlayerStore((state) => state.seek);

    const { displayTime, safeDuration, handleTimeChange, handleSeekCommit } = useSeekProgress(
        currentTime,
        track?.durationMs,
        seek,
    );

    return (
        <div>
            <Flex justify="space-between">
                <p>{formatTime(displayTime)}</p>
                <span>{formatTime(safeDuration / 1000)}</span>
            </Flex>

            <Slider
                time={displayTime}
                duration={safeDuration / 1000}
                onChange={handleTimeChange}
                onChangeEnd={handleSeekCommit}
            />
        </div>
    );
};
