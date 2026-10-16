import styles from "./MainLayout.module.scss";
import { Outlet } from "react-router";
import { Titlebar } from "@/widgets/Titlebar";
import { Sidebar } from "@/widgets/Sidebar";
import { PlayerBar } from "@/widgets/PlayerBar";

export const MainLayout = () => {
    return (
        <>
            <Titlebar />

            <div className={styles.body}>
                <Sidebar />

                <div className={styles.main}>
                    <main className={styles.scrollContent}>
                        <Outlet />
                    </main>

                    <PlayerBar />
                </div>
            </div>
        </>
    );
};
