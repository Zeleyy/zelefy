import styles from "./ThemePreview.module.scss";
import clsx from "clsx";
import type { Theme } from "@/shared/lib/stores";

interface ThemePreviewProps {
    theme: Theme;
    title?: string;
    isActive?: boolean;
    onSelect?: (theme: Theme) => void;
}

export const ThemePreview = ({ theme, title, isActive, onSelect }: ThemePreviewProps) => {
    return (
        <div
            className={clsx(styles.preview, { [styles["preview--active"]]: isActive })}
            onClick={() => onSelect?.(theme)}
            data-theme={theme}
        >
            <div className={styles.frame}>
                <div className={styles.titlebar}>
                    <div className={styles.search} />
                </div>

                <div className={styles.body}>
                    <div className={styles.sidebar}>
                        <div className={clsx(styles.nav, styles["nav--active"])} />
                        <div className={styles.nav} />
                        <div className={styles.nav} />
                    </div>

                    <div className={styles.main}>
                        <div className={styles.header}>
                            <div className={styles.track}>
                                <div className={styles.title} />
                                <div className={styles.progress}>
                                    <div className={styles.active} />
                                </div>
                            </div>
                            <div className={styles.image} />
                        </div>
                    </div>
                </div>
            </div>

            {title && <span className={styles.preview__title}>{title}</span>}
        </div>
    );
};
