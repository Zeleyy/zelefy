import type { Library } from "./libraries";

export const TrackFileType = {
    audio: 0,
    cover: 1,
    waveform: 2,
} as const;

export type TrackFileType = (typeof TrackFileType)[keyof typeof TrackFileType];

export interface Track {
    trackId: number;
    title: string;
    metadataArtist: string | null;
    durationSeconds: number;
    genre: string | null;
    bpm: number | null;
    keySignature: string | null;
    description: string | null;
    createdAt: string;
}

export interface TrackFile {
    fileId: number;
    trackId: number;
    trackFileType: TrackFileType;

    libraryId: number | null;
    path: string;
    isLink: boolean;
    sizeBytes: number;
    hash: string | null;

    lastAccessedAt: string;
    createdAt: string;
}

export interface TrackFileResponse extends TrackFile {
    library: Library;
}

export interface LocalTrackResponse extends Track {
    trackFiles: TrackFileResponse[];
}
