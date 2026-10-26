import { useState } from "react";

export const useSeekProgress = (
    currentTime: number = 0,
    duration?: number | null,
    onSeek?: (time: number) => void,
) => {
    const [dragTime, setDragTime] = useState<number | null>(null);

    const displayTime = dragTime ?? currentTime;
    const safeDuration = duration && duration > 0 ? duration : 1;

    const handleTimeChange = (newTime: number) => {
        setDragTime(newTime);
    };

    const handleSeekCommit = (newTime: number) => {
        onSeek?.(newTime);
        setDragTime(null);
    };

    return {
        displayTime,
        safeDuration,
        handleTimeChange,
        handleSeekCommit,
    };
};
