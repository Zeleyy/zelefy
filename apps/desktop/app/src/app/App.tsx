import { RouterProvider } from "react-router";
import { router } from "./providers";

const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
