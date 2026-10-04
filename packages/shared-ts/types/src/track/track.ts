export const TrackStatus = {
    pending: "pending",
    processing: "processing",
    ready: "ready",
    failed: "failed",
} as const;

export type TrackStatus = (typeof TrackStatus)[keyof typeof TrackStatus];

export interface TrackStats {
    playsCount: number;
    likesCount: number;
    repostsCount: number;
    commentsCount: number;
}

interface BaseTrack {
    trackId: string;
    userId: string;
    permalink: string;
    coverUrl: string | null;
    waveformUrl: string | null;
    genre: string | null;
    description: string | null;
    bpm: number | null;
    keySignature: string | null;
    createdAt: string;
}

export interface Track extends BaseTrack {
    title: string | null;
    audioUrl: string | null;
    durationSeconds: number | null;
    isPrivate: boolean;
    status: TrackStatus;
    processingError: string | null;
    updatedAt: string;
}

export interface PublicTrack extends BaseTrack, TrackStats {
    title: string;
    audioUrl: string;
    durationSeconds: number;
}
