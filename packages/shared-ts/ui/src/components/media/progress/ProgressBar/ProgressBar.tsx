import styles from "./ProgressBar.module.scss";
import * as Slider from "@radix-ui/react-slider";

interface ProgressBarProps {
    time?: number;
    duration?: number;
    step?: number;
    disabled?: boolean;
    onChange?: (time: number) => void;
    onChangeEnd?: (time: number) => void;
    orientation?: "horizontal" | "vertical";
}

export const ProgressBar = ({
    time = 0,
    duration = 100,
    step = 0.1,
    disabled = false,
    onChange,
    onChangeEnd,
    orientation,
}: ProgressBarProps) => {
    return (
        <Slider.Root
            className={styles.sliderRoot}
            value={[time]}
            max={duration || 100}
            step={step}
            disabled={disabled}
            onValueChange={([val]) => onChange?.(val)}
            onValueCommit={([val]) => onChangeEnd?.(val)}
            aria-label="Track progress"
            orientation={orientation}
        >
            <Slider.Track className={styles.sliderTrack}>
                <Slider.Range className={styles.sliderRange} />
            </Slider.Track>
            <Slider.Thumb className={styles.sliderThumb} aria-label="Current time">
                <span className={styles.thumbVisual}></span>
            </Slider.Thumb>
        </Slider.Root>
    );
};
