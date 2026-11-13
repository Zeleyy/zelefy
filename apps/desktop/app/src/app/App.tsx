import { RouterProvider } from "react-router";
import { router } from "./providers";
import { useJobsBridge } from "@/shared/lib/hooks";
import { usePlayerBridge } from "@/features/player";

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
