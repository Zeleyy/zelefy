import styles from "./TasksDrawer.module.scss";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer, Tabs, type TabItem } from "@zelefy/ui";
import { ActiveJobsTab } from "./ActiveJobsTab";
import { AllJobsTab } from "./AllJobsTab";

type TasksTab = "active" | "all";

export interface TasksDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const TasksDrawer = ({ open, onOpenChange }: TasksDrawerProps) => {
    const { t } = useTranslation();
    const [tab, setTab] = useState<TasksTab>("active");

    const tabs: TabItem<TasksTab>[] = useMemo(
        () => [
            { label: t("tasks.tab.active.title"), value: "active" },
            { label: t("tasks.tab.all.title"), value: "all" },
        ],
        [t],
    );

    return (
        <Drawer
            title={t("tasks.title")}
            className={styles.drawer}
            open={open}
            onOpenChange={onOpenChange}
        >
            <Tabs<TasksTab>
                active={tab}
                tabs={tabs}
                onTabClick={(value) => {
                    setTab(value);
                }}
            />

            {tab === "active" ? <ActiveJobsTab /> : <AllJobsTab />}
        </Drawer>
    );
};
