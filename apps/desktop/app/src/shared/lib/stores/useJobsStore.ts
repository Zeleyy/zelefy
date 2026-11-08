import { create } from "zustand";
import type { JobEvent } from "@/shared/types";

interface JobsState {
    jobs: JobEvent[];
    upsert: (job: JobEvent) => void;
    merge: (snapshot: JobEvent[]) => void;
    remove: (jobId: number) => void;
}

export const useJobsStore = create<JobsState>((set) => ({
    jobs: [],
    upsert: (job) =>
        set((s) => {
            const idx = s.jobs.findIndex((j) => j.jobId === job.jobId);
            if (idx === -1) return { jobs: [...s.jobs, job] };
            const next = s.jobs.slice();
            next[idx] = job;
            return { jobs: next };
        }),
    merge: (snapshot) =>
        set((s) => {
            const known = new Set(s.jobs.map((j) => j.jobId));
            const fresh = snapshot.filter((j) => !known.has(j.jobId));
            return fresh.length ? { jobs: [...s.jobs, ...fresh] } : s;
        }),
    remove: (jobId) => set((s) => ({ jobs: s.jobs.filter((j) => j.jobId !== jobId) })),
}));
