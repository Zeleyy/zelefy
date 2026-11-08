import type { JobCursor, JobsPage } from "@/shared/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export const useJobs = () => {
    return useInfiniteQuery({
        queryKey: ["jobs", "feed"],
        queryFn: async ({ pageParam }: { pageParam: JobCursor | null }) => {
            return await invoke<JobsPage>("get_jobs_page", {
                after: pageParam,
                limit: 20,
            });
        },
        initialPageParam: null as JobCursor | null,
        getNextPageParam: (lastPage, allPages) => {
            const next = lastPage.nextCursor;
            if (!next) return undefined;
            const seen = allPages.slice(0, -1).some((p) => p.nextCursor?.jobId === next.jobId);
            return seen ? undefined : next;
        },
    });
};
