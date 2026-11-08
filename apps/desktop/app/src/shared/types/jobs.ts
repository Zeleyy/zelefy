import type { CursorPage } from "@zelefy/types";

export type JobKind = "waveform";

export type JobStatus = "pending" | "running" | "done" | "failed" | "cancelled";

export type JobPayload = { kind: "waveform"; trackId: number };

export interface JobEvent {
    jobId: number;
    kind: JobKind;
    payload: JobPayload;
    status: JobStatus;
    error: string | null;
}

export interface JobCursor {
    jobId: number;
}

export type JobsPage = CursorPage<JobEvent, JobCursor>;
