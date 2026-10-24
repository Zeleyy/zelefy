import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./providers";

const App = () => {
    return (
        <>
            <Toaster position="top-right" richColors closeButton />
            <RouterProvider router={router} />
        </>
    );
};

export default App;
