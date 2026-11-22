import { RouterProvider } from "react-router";
import { router } from "./router";
import { usePlayerBridge } from "@/features/player";
import { useJobsBridge } from "@/features/job";

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
