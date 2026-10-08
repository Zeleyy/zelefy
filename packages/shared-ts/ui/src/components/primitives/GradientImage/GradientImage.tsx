import styles from "./GradientImage.module.scss";
import type { ReactNode } from "react";
import { Image, type ImageProps } from "../Image";
import { getGradientByString } from "../../../utils";

export interface GradientImageProps extends ImageProps {
    seed?: string;
    fallbackContent?: ReactNode;
}

export const GradientImage = ({
    seed = "",
    fallbackContent,
    fallbackNode,
    ...rest
}: GradientImageProps) => {
    const backgroundGradient = getGradientByString(seed);

    return (
        <Image
            {...rest}
            fallbackNode={
                fallbackNode ?? (
                    <div
                        className={styles.gradientFallback}
                        style={{ background: backgroundGradient }}
                    >
                        {fallbackContent}
                    </div>
                )
            }
        />
    );
};
