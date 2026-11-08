import styles from "./TasksDrawer.module.scss";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Drawer, Flex } from "@zelefy/ui";
import { ActiveJobsTab } from "./ActiveJobsTab";
import { AllJobsTab } from "./AllJobsTab";

export interface TasksDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const TasksDrawer = ({ open, onOpenChange }: TasksDrawerProps) => {
    const { t } = useTranslation();
    const [tab, setTab] = useState<"active" | "all">("active");

    return (
        <Drawer
            title={t("tasks.title")}
            className={styles.drawer}
            open={open}
            onOpenChange={onOpenChange}
        >
            <Flex gap="2xs">
                <Button
                    variant={tab === "active" ? "primary" : "ghost"}
                    onClick={() => setTab("active")}
                >
                    Активные
                </Button>
                <Button variant={tab === "all" ? "primary" : "ghost"} onClick={() => setTab("all")}>
                    Все
                </Button>
            </Flex>

            {tab === "active" ? <ActiveJobsTab /> : <AllJobsTab />}
        </Drawer>
    );
};
