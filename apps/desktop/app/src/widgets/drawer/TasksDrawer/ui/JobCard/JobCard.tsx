import type { JobEvent } from "@/shared/types";
import styles from "./JobCard.module.scss";

interface JobCardProps {
    job: JobEvent;
}

export const JobCard = ({ job }: JobCardProps) => {
    return (
        <div className={styles.card}>
            <div className={styles.row}>
                <span className={styles.id}>#{job.jobId}</span>
                <span className={styles.trackId}>
                    {job.payload.trackId != null ? `track ${job.payload.trackId}` : "no track"}
                </span>
                <span className={[styles.status, styles[`status--${job.status}`]].join(" ")}>
                    {job.status}
                </span>
            </div>

            {job.error && <div className={styles.error}>{job.error}</div>}
        </div>
    );
};
