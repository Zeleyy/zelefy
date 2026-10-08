export const StorageType = {
    Cache: 0,
    Library: 1,
} as const;

export type StorageType = (typeof StorageType)[keyof typeof StorageType];

export interface StorageItem {
    storageId: number;
    path: string;
    storageType: StorageType;
    isPrimary: boolean;
    maxSizeBytes: number | null;
    usedSizeBytes: number;
    filesCount: number;
}
