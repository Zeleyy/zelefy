import styles from "./MainLayout.module.scss";
import { Outlet } from "react-router";
import { Flex } from "@zelefy/ui";
import { Titlebar } from "@/widgets/Titlebar";
import { Sidebar } from "@/widgets/Sidebar";
import { PlayerBar } from "@/widgets/PlayerBar";
import { AppToaster } from "@/shared/ui";

export const MainLayout = () => {
    return (
        <>
            <Titlebar />

            <div className={styles.body}>
                <Sidebar />

                <div className={styles.main} data-scrollbar>
                    <main className={styles.scrollContent}>
                        <Flex direction="column" gap="lg" size="page-md" container fullWidth>
                            <Outlet />
                        </Flex>
                    </main>

                    <PlayerBar />
                </div>

                <div id="drawer-root" className={styles.drawerRoot} />

                <div id="modal-root" className={styles.modalRoot} />

                <AppToaster />
            </div>
        </>
    );
};
