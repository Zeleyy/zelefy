import type { CursorPage, NullablePatch, PlayerTrack } from "@zelefy/types";
import { toSrc } from "@/shared/lib/utils";

export const FileType = {
    audio: 0,
    image: 1,
    waveform: 2,
} as const;

export type FileType = (typeof FileType)[keyof typeof FileType];

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
    FileType: FileType;

    libraryId: number | null;
    path: string;
    isLink: boolean;
    sizeBytes: number;
    hash: string | null;

    lastAccessedAt: string;
    createdAt: string;
}

export interface TrackFileWithPath extends TrackFile {
    fullPath: string;
    isLink: boolean;
    sizeBytes: number;
}

export interface TrackFilesWithPath {
    audio: TrackFileWithPath;
    image: TrackFileWithPath | null;
    waveform: TrackFileWithPath | null;
}

export interface LocalTrackResponse extends Track, TrackFilesWithPath {}

export const toPlayerTrack = (track: LocalTrackResponse): PlayerTrack => ({
    trackId: track.trackId,
    title: track.title,
    metadataArtist: track.metadataArtist,
    audioSrc: toSrc(track.audio.fullPath)!,
    coverSrc: toSrc(track.image?.fullPath),
    waveformSrc: toSrc(track.waveform?.fullPath),
    durationMs: track.durationMs,
    genre: track.genre,
});

export interface LocalTrackIdResponse extends TrackFilesWithPath {
    trackId: number;
}

export interface UpdateTrack {
    title?: string;
    metadataArtist?: NullablePatch<string>;
    genre?: NullablePatch<string>;
    bpm?: NullablePatch<number>;
    keySignature?: NullablePatch<string>;
    description?: NullablePatch<string>;
}

export interface UpdateTrackRequest extends UpdateTrack {
    newCoverPath?: NullablePatch<string>;
}

export interface LocalTrack extends Track {
    fileId: number | null;
    fileSizeBytes: number;
}

export interface LocalTrackCursor {
    trackId: number;
}

export type LocalTracksPage = CursorPage<LocalTrackIdResponse, LocalTrackCursor>;
export type LocalTrackIdsPage = CursorPage<number, LocalTrackCursor>;
