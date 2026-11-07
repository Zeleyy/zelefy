import styles from "./TasksDrawer.module.scss";
import { useTranslation } from "react-i18next";
import { Drawer } from "@zelefy/ui";

export interface TasksDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const TasksDrawer = ({ open, onOpenChange }: TasksDrawerProps) => {
    const { t } = useTranslation();

    return (
        <Drawer
            title={t("tasks.title")}
            className={styles.drawer}
            open={open}
            onOpenChange={onOpenChange}
        >
            <div></div>
        </Drawer>
    );
};
