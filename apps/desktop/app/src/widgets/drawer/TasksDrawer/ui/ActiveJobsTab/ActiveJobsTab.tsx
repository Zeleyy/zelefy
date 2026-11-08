import { Flex } from "@zelefy/ui";
import { useJobsStore } from "@/shared/lib/stores";
import { JobCard } from "../JobCard";

export const ActiveJobsTab = () => {
    const jobs = useJobsStore((s) => s.jobs);

    if (jobs.length === 0) {
        return <div>Нет активных задач</div>;
    }

    return (
        <Flex direction="column" gap="sm">
            {jobs.map((item) => (
                <JobCard key={item.jobId} job={item} />
            ))}
        </Flex>
    );
};
