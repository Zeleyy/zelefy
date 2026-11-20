import styles from "./Slider.module.scss";
import * as SliderPrimitive from "@radix-ui/react-slider";

export interface SliderProps {
    time?: number;
    duration?: number;
    step?: number;
    disabled?: boolean;
    onChange?: (time: number) => void;
    onChangeEnd?: (time: number) => void;
    orientation?: "horizontal" | "vertical";
}

export const Slider = ({
    time = 0,
    duration = 100,
    step = 0.1,
    disabled = false,
    onChange,
    onChangeEnd,
    orientation,
}: SliderProps) => {
    return (
        <SliderPrimitive.Root
            className={styles.sliderRoot}
            value={[time]}
            max={duration || 100}
            step={step}
            disabled={disabled}
            onValueChange={([val]) => onChange?.(val)}
            onValueCommit={([val]) => onChangeEnd?.(val)}
            aria-label="Seek"
            orientation={orientation}
        >
            <SliderPrimitive.Track className={styles.sliderTrack}>
                <SliderPrimitive.Range className={styles.sliderRange} />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className={styles.sliderThumb} aria-label="Current time">
                <span className={styles.thumbVisual}></span>
            </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
    );
};
