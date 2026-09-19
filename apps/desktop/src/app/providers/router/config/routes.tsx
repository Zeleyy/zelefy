import { HomePage } from "@/pages";
import { Titlebar } from "@/widgets/titlebar";
import type { RouteObject } from "react-router-dom";

export const routes: RouteObject[] = [
    {
        element: <Titlebar />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "*",
                element: <div>Страница не найдена</div>,
            },
        ],
    },
];
