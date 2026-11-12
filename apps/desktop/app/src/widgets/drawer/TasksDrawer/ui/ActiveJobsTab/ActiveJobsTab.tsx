import { EmptyState, Flex } from "@zelefy/ui";
import { useJobsStore } from "@/shared/lib/stores";
import { JobCard } from "../JobCard";
import { useTranslation } from "react-i18next";

export const ActiveJobsTab = () => {
    const { t } = useTranslation();
    const jobs = useJobsStore((s) => s.jobs);

    if (jobs.length === 0) {
        return <EmptyState title={t("tasks.tab.active.empty")} />;
    }

    return (
        <Flex direction="column" gap="sm">
            {jobs.map((item) => (
                <JobCard key={item.jobId} job={item} />
            ))}
        </Flex>
    );
};
