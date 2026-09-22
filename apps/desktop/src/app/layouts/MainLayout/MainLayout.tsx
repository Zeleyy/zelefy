import styles from "./MainLayout.module.scss";
import { Outlet } from "react-router-dom";
import { Titlebar } from "@/widgets/Titlebar";
import { Sidebar } from "@/widgets/Sidebar";
import { PlayerBar } from "@/widgets/PlayerBar";

export const MainLayout = () => {
    return (
        <>
            <Titlebar />

            <div className={styles.body}>
                <Sidebar />

                <div className={styles.contentWrapper}>
                    <main className={styles.main}>
                        <Outlet />
                    </main>

                    <PlayerBar />
                </div>
            </div>
        </>
    );
};
