export type NullablePatch<T> = T | null;

export interface CursorPage<T, C> {
    items: T[];
    nextCursor: C | null;
}
