import { memo } from "react";

interface WaveformPathsProps {
    top: string;
    bottom: string;
}

export const WaveformPaths = memo(({ top, bottom }: WaveformPathsProps) => (
    <>
        <path d={top} />
        <path d={bottom} opacity={0.5} />
    </>
));

WaveformPaths.displayName = "WaveformPaths";
