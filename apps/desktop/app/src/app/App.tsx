import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./providers";
import { useJobsBridge, usePlayerBridge } from "@/shared/lib/hooks";

const App = () => {
    usePlayerBridge();
    useJobsBridge();

    return (
        <>
            <Toaster position="top-right" richColors closeButton />
            <RouterProvider router={router} />
        </>
    );
};

export default App;
