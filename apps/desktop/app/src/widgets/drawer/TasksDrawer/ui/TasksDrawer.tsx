import styles from "./TasksDrawer.module.scss";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer, Tabs } from "@zelefy/ui";
import { ActiveJobsTab } from "./ActiveJobsTab";
import { AllJobsTab } from "./AllJobsTab";

export interface TasksDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const TasksDrawer = ({ open, onOpenChange }: TasksDrawerProps) => {
    const { t } = useTranslation();
    const [tab, setTab] = useState("active");

    const tabs = [
        {
            label: t("tasks.tab.active.title"),
            value: "active",
        },
        {
            label: t("tasks.tab.all.title"),
            value: "all",
        },
    ];

    return (
        <Drawer
            title={t("tasks.title")}
            className={styles.drawer}
            open={open}
            onOpenChange={onOpenChange}
        >
            <Tabs
                active={tab}
                tabs={tabs}
                onTabClick={(tab) => {
                    setTab(tab);
                }}
            />

            {tab === "active" ? <ActiveJobsTab /> : <AllJobsTab />}
        </Drawer>
    );
};
