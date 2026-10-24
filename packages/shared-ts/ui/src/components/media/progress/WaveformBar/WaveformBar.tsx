import styles from "./WaveformBar.module.scss";
import { useId, useMemo } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Flex } from "../../../primitives";
import { formatTime } from "../../../../utils";
import { useElementWidth } from "../../../../utils/hooks";
import { WaveformPaths } from "./WaveformPaths";
import { buildPaths, downsample } from "./waveform";

export interface WaveformBarProps {
    data: Uint8Array;
    duration?: number;
    time?: number;
    height?: number;
    barWidth?: number;
    gap?: number;
    baseline?: number;
    className?: string;
    onChange?: (time: number) => void;
    onChangeEnd?: (time: number) => void;
}

export const WaveformBar = ({
    data,
    duration = 0,
    time = 0,
    height = 130,
    barWidth = 2,
    gap = 1,
    baseline = 0.5,
    className,
    onChange,
    onChangeEnd,
}: WaveformBarProps) => {
    const [ref, width] = useElementWidth<HTMLDivElement>();

    const step = barWidth + gap;
    const bars = Math.max(0, Math.floor((width + gap) / step));

    const peaks = useMemo(() => {
        if (bars === 0) return [];
        const sampled = downsample(data, bars);
        let max = 0;
        for (const v of sampled) if (v > max) max = v;
        return sampled.map((v) => (max === 0 ? 0 : v / max));
    }, [data, bars]);

    const progress = duration > 0 ? Math.min(1, Math.max(0, time / duration)) : 0;

    const baseY = Math.round(height * baseline);
    const topMax = baseY;
    const bottomMax = height - baseY;
    const clipId = useId().replace(/:/g, "");
    const playedWidth = Math.round(progress * bars) * step;

    const { top, bottom } = useMemo(
        () => buildPaths({ peaks, step, barWidth, baseY, topMax, bottomMax }),
        [peaks, step, barWidth, baseY, topMax, bottomMax],
    );

    return (
        <Flex align="center" className={styles.waveformBar}>
            <Slider.Root
                value={[time]}
                max={duration || 100}
                step={0.1}
                onValueChange={([v]) => onChange?.(v)}
                onValueCommit={([v]) => onChangeEnd?.(v)}
                style={{ position: "relative", width: "100%", height }}
            >
                <Slider.Track asChild>
                    <div
                        ref={ref}
                        className={className}
                        style={{ width: "100%", position: "relative", height }}
                    >
                        <Slider.Thumb
                            aria-label="Seek"
                            className={styles.sliderThumb}
                            style={{ height }}
                        >
                            <span className={styles.thumbVisual} />
                        </Slider.Thumb>

                        <svg
                            width={width}
                            height={height}
                            viewBox={`0 0 ${width} ${height}`}
                            shapeRendering="crispEdges"
                            aria-hidden="true"
                            focusable="false"
                            style={{ display: "block" }}
                        >
                            <defs>
                                <clipPath id={clipId}>
                                    <rect x={0} y={0} width={playedWidth} height={height} />
                                </clipPath>
                            </defs>

                            <g className={styles.bars} style={{ transformOrigin: `0 ${baseY}px` }}>
                                <g fill="var(--text-muted)">
                                    <WaveformPaths top={top} bottom={bottom} />
                                </g>
                                <g fill="var(--primary)" clipPath={`url(#${clipId})`}>
                                    <WaveformPaths top={top} bottom={bottom} />
                                </g>
                            </g>
                        </svg>

                        <Slider.Range style={{ display: "none" }} />
                    </div>
                </Slider.Track>
            </Slider.Root>

            <Flex direction="column" style={{ height }} className={styles.timeBlock}>
                <Flex align="flex-end" style={{ height: baseY }} className={styles.time}>
                    {formatTime(time)}
                </Flex>
                <Flex align="flex-start" style={{ height: bottomMax }}>
                    {formatTime(duration)}
                </Flex>
            </Flex>

            <div
                className={styles.line}
                style={{
                    top: baseY,
                }}
            />
        </Flex>
    );
};
