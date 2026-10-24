export interface Library {
    libraryId: number;
    path: string;
    isPrimary: boolean;
    maxSizeBytes: number | null;
    createdAt: number;
}

export interface NewLibrary {
    path: string;
    isPrimary: boolean;
    maxSizeBytes: number | null;
}

export interface UpdateLibrary {
    path?: string;
    isPrimary?: boolean;
    maxSizeBytes?: number | null;
}

export interface LibraryWithStats extends Library {
    usedSizeBytes: number;
    filesCount: number;
}
