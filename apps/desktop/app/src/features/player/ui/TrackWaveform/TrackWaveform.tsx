import { useSeekProgress, WaveformBar, type WaveformBarProps } from "@zelefy/ui";
import { usePlayerStore } from "../../model";

type TrackWaveformProps = Omit<
    WaveformBarProps,
    "time" | "duration" | "onChange" | "onChangeEnd"
> & {
    isCurrentTrack?: boolean;
    durationMs?: number;
    onSeek?: (time: number) => void;
};

export const TrackWaveform = ({
    isCurrentTrack = false,
    durationMs,
    onSeek,
    ...rest
}: TrackWaveformProps) => {
    const currentTime = usePlayerStore((s) => s.currentTime);
    const seek = usePlayerStore((s) => s.seek);

    const { displayTime, safeDuration, handleTimeChange, handleSeekCommit } = useSeekProgress(
        isCurrentTrack ? currentTime : 0,
        durationMs,
        onSeek ?? seek,
    );

    return (
        <WaveformBar
            {...rest}
            time={displayTime}
            duration={safeDuration / 1000}
            onChange={handleTimeChange}
            onChangeEnd={handleSeekCommit}
        />
    );
};
