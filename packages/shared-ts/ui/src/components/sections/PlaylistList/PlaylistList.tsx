import { Flex } from "../../primitives";
import styles from "./PlaylistList.module.scss";
import clsx from "clsx";

interface PlaylistListProps {
    title?: string;
    children: React.ReactNode;
    layout?: "row" | "grid";
    minColumnWidth?: number | string;
    className?: string;
}

export const PlaylistList = ({
    title,
    children,
    layout = "row",
    minColumnWidth = 188,
    className,
}: PlaylistListProps) => {
    return (
        <Flex direction="column" gap="sm">
            {title && <h3>{title}</h3>}
            <div
                className={clsx(styles.list, styles[`list--${layout}`], className)}
                style={
                    {
                        "--card-min":
                            typeof minColumnWidth === "number"
                                ? `${minColumnWidth}px`
                                : minColumnWidth,
                    } as React.CSSProperties
                }
            >
                {children}
            </div>
        </Flex>
    );
};
