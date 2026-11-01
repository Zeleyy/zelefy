import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./providers";
import { usePlayerBridge } from "@/shared/lib/hooks";

const App = () => {
    usePlayerBridge();

    return (
        <>
            <Toaster position="top-right" richColors closeButton />
            <RouterProvider router={router} />
        </>
    );
};

export default App;
