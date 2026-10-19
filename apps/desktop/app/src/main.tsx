import "./app/styles/index.scss";
import { createRoot } from "react-dom/client";
import { QueryProvider } from "./app/providers";
import { bootstrapApp } from "./app/init";
import App from "./app/App";

const root = createRoot(document.getElementById("root") as HTMLElement);

bootstrapApp()
    .then(() => {
        root.render(
            <QueryProvider>
                <App />
            </QueryProvider>,
        );
    })
    .catch((error) => {
        console.error("Failed to initialize app:", error);
    });
