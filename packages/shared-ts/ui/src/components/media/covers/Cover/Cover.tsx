import styles from "./Cover.module.scss";
import type { ReactNode } from "react";
import clsx from "clsx";
import { GradientImage } from "../../../primitives";

export type CoverSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface CoverProps {
    src?: string;
    size?: CoverSize;
    alt?: string;
    className?: string;
    children?: ReactNode;
}

export const Cover = ({
    src,
    size = "md",
    alt = "Track cover",
    className,
    children,
}: CoverProps) => (
    <GradientImage
        className={clsx(styles.cover, styles[`cover--${size}`], className)}
        src={src}
        seed={alt}
        aspectRatio="1/1"
        alt={alt}
    >
        {children}
    </GradientImage>
);
