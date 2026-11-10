import { RouterProvider } from "react-router";
import { router } from "./providers";
import { useJobsBridge, usePlayerBridge } from "@/shared/lib/hooks";

const App = () => {
    usePlayerBridge();
    useJobsBridge();

    return (
        <>
            <RouterProvider router={router} />
        </>
    );
};

export default App;
