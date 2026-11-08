import { useEffect, useRef, useMemo } from "react";
import { Flex, Icon, SpinnerLoader } from "@zelefy/ui";
import { useJobs } from "@/features/job";
import { JobCard } from "../JobCard";

export const AllJobsTab = () => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
        useJobs();

    const jobs = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { rootMargin: "200px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) return <SpinnerLoader isLoading />;
    if (isError) return <div>{String(error)}</div>;
    if (jobs.length === 0) return <div>Задач нет</div>;

    return (
        <Flex direction="column" gap="sm">
            {jobs.map((item) => (
                <JobCard key={item.jobId} job={item} />
            ))}

            <div ref={sentinelRef} style={{ height: 1 }} />

            <Flex align="center" justify="center">
                <SpinnerLoader isLoading={isFetchingNextPage} />

                {!hasNextPage && <Icon name="zelefy" color="var(--text-muted)" size={18} />}
            </Flex>
        </Flex>
    );
};
