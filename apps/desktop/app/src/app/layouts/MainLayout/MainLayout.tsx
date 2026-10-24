import styles from "./MainLayout.module.scss";
import { Outlet } from "react-router";
import { Titlebar } from "@/widgets/Titlebar";
import { Sidebar } from "@/widgets/Sidebar";
import { PlayerBar } from "@/widgets/PlayerBar";
import { Flex } from "@zelefy/ui";

export const MainLayout = () => {
    return (
        <>
            <Titlebar />

            <div className={styles.body}>
                <Sidebar />

                <div className={styles.main}>
                    <main className={styles.scrollContent}>
                        <Flex direction="column" gap="lg" size="page-md" container fullWidth>
                            <Outlet />
                        </Flex>
                    </main>

                    <PlayerBar />
                </div>
            </div>
        </>
    );
};
