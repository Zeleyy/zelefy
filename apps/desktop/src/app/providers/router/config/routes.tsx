import { MainLayout } from "@/app/layouts";
import { HomePage, LibraryPage, OfflinePage, ProfilePage, SearchPage, SettingsPage } from "@/pages";
import type { RouteObject } from "react-router-dom";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "search",
                element: <SearchPage />,
            },
            {
                path: "library",
                element: <LibraryPage />,
            },
            {
                path: "offline",
                element: <OfflinePage />,
            },
            {
                path: "settings",
                element: <SettingsPage />,
            },
            {
                path: "profile",
                element: <ProfilePage />,
            },

            {
                path: "*",
                element: <div>Страница не найдена</div>,
            },
        ],
    },
];
