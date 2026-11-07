import styles from "./QueueDrawer.module.scss";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Button, Cover, Drawer, Flex, formatTime, Icon } from "@zelefy/ui";
import { usePlayerStore } from "@/shared/lib/stores";

export interface QueueDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const QueueDrawer = ({ open, onOpenChange }: QueueDrawerProps) => {
    const { t } = useTranslation();
    const queue = usePlayerStore((s) => s.queue);
    const currentQid = usePlayerStore((s) => s.queue[s.currentIndex]?.qid ?? null);
    const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const playFromQueue = usePlayerStore((s) => s.playFromQueue);
    const clearQueue = usePlayerStore((s) => s.clearQueue);

    return (
        <Drawer
            title={
                <Flex gap="xs" justify="space-between" align="center" className={styles.header}>
                    <Flex as={"span"} gap="xs" align="center">
                        <span className={styles.header__title}>{t("queue.title")}</span>
                        <span className={styles.header__count}>{queue.length}</span>
                    </Flex>

                    <Button
                        variant="ghost"
                        size="small"
                        className={styles.header__clear}
                        onClick={() => clearQueue()}
                    >
                        <span>{t("queue.clear")}</span>
                        <Icon name="action-delete" size={13} />
                    </Button>
                </Flex>
            }
            open={open}
            onOpenChange={onOpenChange}
        >
            <Flex
                direction="column"
                gap="xs"
                role="listbox"
                onPointerDown={(e) => e.stopPropagation()}
            >
                {queue.map((item, i) => {
                    const isActive = currentQid === item.qid;

                    return (
                        <div
                            key={item.qid}
                            className={clsx(styles.queue__row, {
                                [styles["queue__row--active"]]: isActive,
                            })}
                            role="option"
                            aria-selected={isActive}
                            onClick={() => {
                                if (isActive) {
                                    togglePlay();
                                    return;
                                }

                                playFromQueue(item.qid);
                            }}
                        >
                            <span className={styles.queue__index}>{i + 1}</span>

                            <div className={styles.queue__track}>
                                <Cover
                                    alt={item.track.title}
                                    src={item.track.coverSrc ?? undefined}
                                    size="xs"
                                />
                                <div className={styles.queue__info}>
                                    <span className={styles.queue__title}>{item.track.title}</span>
                                    <span className={styles.queue__artist}>
                                        {item.track.metadataArtist}
                                    </span>
                                </div>
                            </div>

                            <span className={styles.queue__duration}>
                                {formatTime(
                                    item.track.durationMs ? item.track.durationMs / 1000 : 0,
                                )}
                            </span>

                            <div className={styles.queue__actions}>
                                <Button
                                    variant="ghost"
                                    colorScheme={{ bgColorHover: "transparent" }}
                                    square
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <Icon name="player-heart" size={14} />
                                </Button>

                                {!isActive && (
                                    <Button
                                        variant="ghost"
                                        square
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromQueue(item.qid);
                                        }}
                                    >
                                        <Icon name="action-close" size={14} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </Flex>
        </Drawer>
    );
};
