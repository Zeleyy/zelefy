export interface Storage {
    storageId: number;
    path: string;
    isPrimary: boolean;
    maxSizeBytes: number | null;
    createdAt: number;
}

export interface NewStorage {
    path: string;
    isPrimary: boolean;
    maxSizeBytes: number | null;
}

export interface UpdateStorage {
    path?: string;
    isPrimary?: boolean;
    maxSizeBytes?: number | null;
}

export interface StorageWithStats extends Storage {
    usedSizeBytes: number;
    filesCount: number;
}
