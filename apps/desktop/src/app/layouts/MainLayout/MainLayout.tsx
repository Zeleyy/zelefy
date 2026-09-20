import styles from "./MainLayout.module.scss";
import { Outlet } from "react-router-dom";
import { Titlebar } from "@/widgets/Titlebar_";
import { Sidebar } from "@/widgets/Sidebar";

export const MainLayout = () => {
    return (
        <>
            <Titlebar />

            <div className={styles.body}>
                <Sidebar />

                <main className={styles.main}>
                    <Outlet />
                </main>
            </div>
        </>
    );
};
