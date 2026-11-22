import type { CursorPage, NullablePatch } from "@zelefy/types";

export type PlaylistId = string | number;

export interface Playlist {
    playlistId: number;
    title: string;
    description: string | null;
    createdAt: string;
}

export interface PlaylistWithFirstTrackId extends Playlist {
    trackId: number | null;
}

export interface NewPlaylist {
    title: string;
    description: string | null;
}

export interface NewPlaylistRequest extends NewPlaylist {
    trackId: number;
}

export interface UpdatePlaylist {
    title?: string;
    description?: NullablePatch<string>;
}

export interface MoveTrackRequest {
    trackId: number;
    afterTrackId?: number | null;
    beforeTrackId?: number | null;
}

export interface PlaylistTrack {
    playlistId: number;
    trackId: number;
    position: number;
    addedAt: string;
}

export interface PlaylistTrackCursor {
    position: number;
}

export type PlaylistTracksPage = CursorPage<PlaylistTrack, PlaylistTrackCursor>;

export interface PlaylistCursor {
    playlistId: number;
    createdAt: string;
    rank?: number | null;
}

export type PlaylistsPage = CursorPage<PlaylistWithFirstTrackId, PlaylistCursor>;
