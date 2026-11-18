import styles from "./PlayerBar.module.scss";
import { useState } from "react";
import { Link } from "react-router";
import clsx from "clsx";
import { Button, Cover, Flex, Icon } from "@zelefy/ui";
import { useCurrentTrack } from "@/features/player";
import { QueueDrawer } from "@/widgets/drawer";
import { PlayerBarProgress } from "./PlayerBarProgress";
import { PlayerBarVolumeControl } from "./PlayerBarVolumeControl";
import { PlayerBarControls } from "./PlayerBarControls";

export const PlayerBar = () => {
    const track = useCurrentTrack();

    const [lastTrack, setLastTrack] = useState(track);
    if (track && track !== lastTrack) setLastTrack(track);
    const displayTrack = track ?? lastTrack;

    const [isQueueOpen, setIsQueueOpen] = useState(false);

    return (
        <>
            <div
                className={clsx(styles.wrapper, { [styles["wrapper--show"]]: track })}
                aria-hidden={!track}
            >
                <div className={styles.clip}>
                    <Flex align="center" justify="center" className={styles.inner}>
                        <div className={styles.container}>
                            <Flex direction="column" gap="md">
                                <div className={styles.mainControls}>
                                    <Flex align="center" gap="sm" className={styles.shrinkPrevent}>
                                        <Cover
                                            src={displayTrack?.coverSrc ?? undefined}
                                            alt={displayTrack?.title ?? "No track selected"}
                                            size="sm"
                                        />
                                        <div className={styles.meta}>
                                            <Link
                                                to={"/track/" + (displayTrack?.trackId ?? "")}

                                                className={styles.title}
                                            >
                                                {displayTrack?.title ?? "No track selected"}
                                            </Link>
                                            <span className={styles.author}>
                                                {displayTrack?.metadataArtist}
                                            </span>
                                        </div>
                                        <Button variant="ghost" radius="full" square>
                                            <Icon name="player-heart" width={16} height={16} />
                                        </Button>
                                    </Flex>

                                    <div className={styles.divider} />

                                    <PlayerBarControls />

                                    <div className={styles.divider}></div>

                                    <Flex align="center" gap="3xs" className={styles.shrinkPrevent}>
                                        <Button
                                            variant="ghost"
                                            radius="full"
                                            square
                                            className={styles.secondaryControl}
                                        >
                                            <Icon
                                                name="player-audio-settings"
                                                width={16}
                                                height={16}
                                            />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            radius="full"
                                            square
                                            className={styles.tertiaryControl}
                                        >
                                            <Icon name="player-equalizer" width={16} height={16} />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            radius="full"
                                            square
                                            onClick={() => {
                                                setIsQueueOpen((prev) => !prev);
                                            }}
                                        >
                                            <Icon name="player-queue" width={16} height={16} />
                                        </Button>

                                        <PlayerBarVolumeControl />
                                    </Flex>
                                </div>

                                <PlayerBarProgress track={displayTrack} />
                            </Flex>
                        </div>
                    </Flex>
                </div>
            </div>

            <QueueDrawer
                open={isQueueOpen}
                onOpenChange={(open) => {
                    setIsQueueOpen(open);
                }}
            />
        </>
    );
};
