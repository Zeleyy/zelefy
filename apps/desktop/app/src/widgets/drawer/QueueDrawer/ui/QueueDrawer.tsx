import styles from "./QueueDrawer.module.scss";
import { useTranslation } from "react-i18next";
import { Button, DraggableItem, DraggableList, Drawer, Flex, Icon } from "@zelefy/ui";
import { usePlayerStore } from "@/features/player";
import { useQueue } from "@/features/queue";
import { QueueRow } from "./QueueRow";

export interface QueueDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const QueueDrawer = ({ open, onOpenChange }: QueueDrawerProps) => {
    const { t } = useTranslation();
    const { queue } = useQueue();
    const currentQid = usePlayerStore((s) => s.queue[s.currentIndex]?.qid ?? null);
    const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const playFromQueue = usePlayerStore((s) => s.playFromQueue);
    const clearQueue = usePlayerStore((s) => s.clearQueue);
    const replaceTrack = usePlayerStore((s) => s.replaceTrack);

    const handleReorder = (activeId: number, overId: number) => {
        const oldIndex = queue.findIndex((i) => i.qid === activeId);
        const newIndex = queue.findIndex((i) => i.qid === overId);
        if (oldIndex === -1 || newIndex === -1) return;

        if (newIndex > oldIndex) {
            replaceTrack(activeId, overId, undefined);
        } else {
            replaceTrack(activeId, undefined, overId);
        }
    };

    return (
        <Drawer
            title={
                <Flex gap="xs" justify="space-between" align="center" className={styles.header}>
                    <Flex gap="xs" align="center">
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
            <DraggableList<number> items={queue.map((item) => item.qid)} onReorder={handleReorder}>
                <Flex
                    direction="column"
                    gap="xs"
                    role="listbox"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {queue.map((item, i) => {
                        const isActive = currentQid === item.qid;

                        return (
                            <DraggableItem key={item.qid} id={item.qid}>
                                {({ setNodeRef, style, isDragging, listeners, attributes }) => (
                                    <QueueRow
                                        index={i}
                                        track={item.track}
                                        isActive={isActive}
                                        onRowClick={() => {
                                            if (isActive) {
                                                togglePlay();
                                                return;
                                            }
                                            playFromQueue(item.qid);
                                        }}
                                        onRemoveFromQueue={() => removeFromQueue(item.qid)}
                                        setNodeRef={setNodeRef}
                                        style={style}
                                        listeners={listeners}
                                        attributes={attributes}
                                        isDragging={isDragging}
                                    />
                                )}
                            </DraggableItem>
                        );
                    })}
                </Flex>
            </DraggableList>
        </Drawer>
    );
};
