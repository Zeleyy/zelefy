import styles from "./Avatar.module.scss";
import clsx from "clsx";
import { Image } from "../../primitives";
import { getGradientByString } from "../../../utils";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
    src?: string;
    name?: string;
    size?: AvatarSize;
    className?: string;
}

const getInitials = (name?: string): string => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
};

export const Avatar = ({ src, name, size = "md", className }: AvatarProps) => {
    const initials = getInitials(name);
    const backgroundGradient = getGradientByString(name);

    return (
        <Image
            src={src}
            alt={name || "User avatar"}
            aspectRatio="1/1"
            className={clsx(styles.avatar, styles[`avatar--${size}`], className)}
            fallbackNode={
                <div className={styles.gradientFallback} style={{ background: backgroundGradient }}>
                    <span className={styles.initials}>{initials}</span>
                </div>
            }
        />
    );
};
