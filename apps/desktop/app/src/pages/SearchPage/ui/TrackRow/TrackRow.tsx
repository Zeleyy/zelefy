import styles from "./TrackRow.module.scss";
import { memo, type CSSProperties } from "react";
// import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button, Cover, Flex, Icon } from "@zelefy/ui";
import type { TrackId } from "@/entities/track";
import { TrackWaveform, usePlayerStore, useTrack } from "@/features/player";
import { useAddToQueue } from "@/features/queue";
import { useWaveform } from "@/features/waveform";

interface TrackRowProps {
    trackId: TrackId;
    isCurrent?: boolean;
    onAddToPlaylist: (trackId: TrackId) => void;
}

export const TrackRow = memo(({ trackId, isCurrent = false, onAddToPlaylist }: TrackRowProps) => {
    // const { t } = useTranslation();
    const { data: track } = useTrack(trackId);
    const { data: waveform } = useWaveform(track?.waveformSrc);
    const addToQueue = useAddToQueue();
    const playTrack = usePlayerStore((s) => s.playTrack);
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const seek = usePlayerStore((s) => s.seek);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const isActive = isCurrent && isPlaying;

    if (!track) return;

    return (
        <Flex
            className={styles.row}
            gap="md"
            style={{ "--cover-url": `url(${track?.coverSrc})` } as CSSProperties}
        >
            <Cover src={track.coverSrc ?? undefined} alt={track.title ?? ""} size="lg" />

            <Flex direction="column" justify="space-between" gap="sm" className={styles.row__meta}>
                <Flex gap="sm" align="flex-start">
                    <Button
                        radius="full"
                        square
                        onClick={() => (isCurrent ? togglePlay() : playTrack(trackId))}
                    >
                        <Icon name={isActive ? "player-pause" : "player-play"} size={26} />
                    </Button>

                    <Flex direction="column">
                        <Link to={`/track/${trackId}`} className={styles.row__title}>
                            {track.title}
                        </Link>
                        <span className={styles.row__artist}>{track.metadataArtist}</span>
                    </Flex>
                </Flex>

                {waveform && (
                    <TrackWaveform
                        data={waveform}
                        durationMs={track.durationMs}
                        onSeek={(time) => {
                            if (!isCurrent) {
                                playTrack(trackId);
                            }
                            seek(time);
                        }}
                        height={60}
                        baseline={0.65}
                        isCurrentTrack={isCurrent}
                    />
                )}

                <Flex gap="2xs">
                    <Button variant="secondary" square onClick={() => onAddToPlaylist(trackId)}>
                        <Icon name="player-list-plus" size={20} />
                    </Button>

                    <Button variant="secondary" square onClick={() => addToQueue(track)}>
                        <Icon name="player-list-end" size={20} />
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    );
});
