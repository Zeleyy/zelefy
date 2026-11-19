import { TrackHero, type TrackHeroProps } from "@zelefy/ui";
import { usePlayerStore } from "../../model";

type PlayerTrackHeroProps = Omit<
    TrackHeroProps,
    "currentTime" | "onSeek" | "onSeekCommit" | "onTimeChange"
> & {
    isCurrentTrack?: boolean;
    onSeek?: (time: number) => void;
};

export const PlayerTrackHero = ({
    isCurrentTrack = true,
    onTogglePlay,
    onSeek,
    ...props
}: PlayerTrackHeroProps) => {
    const currentTime = usePlayerStore((s) => s.currentTime);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const seek = usePlayerStore((s) => s.seek);

    return (
        <TrackHero
            {...props}
            isPlaying={isCurrentTrack && isPlaying}
            currentTime={isCurrentTrack ? currentTime : 0}
            onSeek={onSeek ?? seek}
            onTogglePlay={onTogglePlay}
        />
    );
};
