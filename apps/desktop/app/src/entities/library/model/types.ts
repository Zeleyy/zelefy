export interface Library {
    libraryId: number;
    path: string;
    isPrimary: boolean;
    createdAt: number;
}

export interface LibraryStats {
    libraryId: number;
    usedSizeBytes: number;
    filesCount: number;
}
