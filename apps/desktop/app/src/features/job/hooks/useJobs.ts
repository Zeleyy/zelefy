import { useInfiniteQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { jobKeys, type JobCursor, type JobsPage } from "@/entities/job";

export const useJobs = () => {
    return useInfiniteQuery({
        queryKey: jobKeys.feeds(),
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
