import type { CursorPage } from "@zelefy/types";

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

export interface PlaylistTrack {
    playlistId: number;
    trackId: number;
    position: number;
    addedAt: string;
}

export interface PlaylistTrackCursor {
    position: number;
}

export type PlaylistTrackPage = CursorPage<PlaylistTrack, PlaylistTrackCursor>;
