import styles from "./Image.module.scss";
import { useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    children?: ReactNode;
    fallbackSrc?: string;
    fallbackNode?: ReactNode;
    showLoader?: boolean;
    cover?: boolean;
    aspectRatio?: string;
    loaderType?: "skeleton" | "spinner";
}

export const Image = ({
    src,
    alt = "",
    className,
    style,
    loading = "lazy",
    fallbackSrc,
    fallbackNode,
    showLoader = true,
    cover = true,
    aspectRatio,
    loaderType = "skeleton",
    onLoad,
    onError,
    children,
    ...rest
}: ImageProps) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(Boolean(src));
    const [prevSrc, setPrevSrc] = useState(src);
    const imgRef = useRef<HTMLImageElement>(null);

    if (src !== prevSrc) {
        setPrevSrc(src);
        setHasError(false);
        setIsLoading(Boolean(src));
    }

    useEffect(() => {
        if (imgRef.current?.complete && imgRef.current.naturalWidth !== 0) {
            setIsLoading(false);
        }
    }, [src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setIsLoading(false);
        onLoad?.(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setIsLoading(false);
        setHasError(true);
        onError?.(e);
    };

    const currentSrc = hasError ? fallbackSrc : src;
    const isFailed = (hasError || !src) && !fallbackSrc;

    return (
        <div className={clsx(styles.wrapper, className)} style={{ aspectRatio, ...style }}>
            {isLoading && showLoader && (
                <div
                    className={clsx(styles.loader, {
                        [styles["loader--skeleton"]]: loaderType === "skeleton",
                    })}
                />
            )}

            {isFailed ? (
                <div className={styles.fallbackContainer}>{fallbackNode}</div>
            ) : (
                <img
                    ref={imgRef}
                    src={currentSrc}
                    alt={alt}
                    loading={loading}
                    className={clsx(styles.image, {
                        [styles["image--cover"]]: cover,
                        [styles["image--hidden"]]: isLoading,
                    })}
                    onLoad={handleLoad}
                    onError={handleError}
                    {...rest}
                />
            )}

            {children}
        </div>
    );
};
