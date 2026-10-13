export const StorageType = {
    Cache: 0,
    Library: 1,
} as const;

export type StorageType = (typeof StorageType)[keyof typeof StorageType];

export interface Storage {
    storageId: number;
    path: string;
    storageType: StorageType;
    isPrimary: boolean;
    maxSizeBytes: number | null;
    createdAt: number;
}

export interface NewStorage {
    path: string;
    storageType: StorageType;
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
