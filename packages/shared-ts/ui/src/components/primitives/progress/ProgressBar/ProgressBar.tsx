import styles from "./ProgressBar.module.scss";
import { Progress } from "@base-ui/react/progress";
import clsx from "clsx";

type ProgressBarSize = "xs" | "sm" | "md" | "lg";
type ProgressBarVariant = "default" | "primary" | "success" | "error";

export interface ProgressBarProps {
    value?: number;
    className?: string;
    size?: ProgressBarSize;
    variant?: ProgressBarVariant;
    showLabel?: boolean;
}

export const ProgressBar = ({
    value = 0,
    className,
    size = "md",
    variant = "default",
    showLabel = false,
}: ProgressBarProps) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    const rootClasses = clsx(
        styles.progress,
        styles[`progress--${size}`],
        styles[`progress--${variant}`],
        className,
    );

    return (
        <Progress.Root value={clampedValue} className={rootClasses} aria-label="Loading">
            <Progress.Track className={styles.track}>
                <Progress.Indicator
                    className={styles.indicator}
                    style={{ width: `${clampedValue}%` }}
                />
            </Progress.Track>
            {showLabel && (
                <span className={styles.label} aria-hidden="true">
                    {Math.round(clampedValue)}%
                </span>
            )}
        </Progress.Root>
    );
};
