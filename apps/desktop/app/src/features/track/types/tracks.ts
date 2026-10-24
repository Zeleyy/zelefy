import type { Track } from "@zelefy/types";

export interface LocalTrack extends Track {
    fileId: number | null;
    fileSizeBytes: number;
}
