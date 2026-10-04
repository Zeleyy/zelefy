import type { NullablePatch } from "../shared";

export interface UpdateTrackMetadataDto {
    title?: string;
    permalink?: string;
    isPrivate?: boolean;

    genre?: NullablePatch<string>;
    description?: NullablePatch<string>;
    bpm?: NullablePatch<number>;
    keySignature?: NullablePatch<string>;
}
