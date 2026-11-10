import styles from "./AppToaster.module.scss";
import { Toaster } from "sonner";

export const AppToaster = () => {
    return (
        <Toaster
            position="top-right"
            style={{ position: "absolute" }}
            offset={{ top: "var(--spacing-md)", right: "var(--spacing-md)" }}
            toastOptions={{
                classNames: {
                    toast: styles.toast,
                    success: styles.toast__success,
                    error: styles.toast__error,
                },
            }}
            richColors
        />
    );
};
