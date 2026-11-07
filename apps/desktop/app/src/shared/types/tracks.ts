import type { NullablePatch, PlayerTrack } from "@zelefy/types";
import type { Library } from "./libraries";
import { trackFilePath, trackFileSrc } from "../lib/utils";

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
    durationMs: number;
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

export interface TrackFilesResponse {
    audio: TrackFileResponse;
    cover: TrackFileResponse | null;
    waveform: TrackFileResponse | null;
}

export interface LocalTrackResponse extends Track, TrackFilesResponse {}

export const toPlayerTrack = (track: LocalTrackResponse): PlayerTrack => ({
    trackId: track.trackId,
    title: track.title,
    metadataArtist: track.metadataArtist,
    audioSrc: trackFilePath(track.audio)!,
    coverSrc: trackFileSrc(track.cover),
    waveformSrc: trackFileSrc(track.waveform),
    durationMs: track.durationMs,
    genre: track.genre,
});

export interface UpdateTrack {
    title?: string;
    metadataArtist?: NullablePatch<string>;
    genre?: NullablePatch<string>;
    bpm?: NullablePatch<number>;
    keySignature?: NullablePatch<string>;
    description?: NullablePatch<string>;
}

export interface UpdateTrackRequest extends UpdateTrack {
    newCoverPath?: string | null;
}
