import styles from "./SpinnerLoader.module.scss";
import type { HTMLAttributes } from "react";
import clsx from "clsx";

type SpinnerLoaderSize = 'small' | 'medium' | 'large';

interface SpinnerLoaderProps extends HTMLAttributes<HTMLDivElement> {
    isLoading?: boolean;
    size?: SpinnerLoaderSize;
    className?: string;
}

export const SpinnerLoader = ({
    isLoading = false,
    size = 'medium',
    className,
    ...rest
}: SpinnerLoaderProps) => {
    if (!isLoading) return null;

    const classNames = clsx(
        styles.spinner,
        styles[`spinner--size-${size}`],
        className,
    );

    return (
        <div
            className={classNames}
            aria-label="Загрузка"
            role="status"
            {...rest}
        />
    );
};