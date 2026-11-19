import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState, Flex, SpinnerLoader } from "@zelefy/ui";
import { InfiniteScrollFooter } from "@/shared/ui";
import { useJobs } from "@/features/job";
import { JobCard } from "../JobCard";

export const AllJobsTab = () => {
    const { t } = useTranslation();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
        useJobs();

    const jobs = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

    if (isLoading) return <SpinnerLoader isLoading />;
    if (isError) return <EmptyState title={"tasks.tab.all.error"} description={String(error)} />;
    if (jobs.length === 0) return <EmptyState title={t("tasks.tab.all.empty")} />;

    return (
        <Flex direction="column" gap="sm">
            {jobs.map((item) => (
                <JobCard key={item.jobId} job={item} />
            ))}

            <InfiniteScrollFooter
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
            />
        </Flex>
    );
};
