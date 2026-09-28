import type { RouteObject } from "react-router-dom";
import { MainLayout } from "@/app/layouts";
import { HomePage } from "@/pages/HomePage";

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
                lazy: async () => {
                    const { SearchPage } = await import("@/pages/SearchPage");
                    return { Component: SearchPage };
                },
            },
            {
                path: "library",
                lazy: async () => {
                    const { LibraryPage } = await import("@/pages/LibraryPage");
                    return { Component: LibraryPage };
                },
            },
            {
                path: "offline",
                lazy: async () => {
                    const { OfflinePage } = await import("@/pages/OfflinePage");
                    return { Component: OfflinePage };
                },
            },
            {
                path: "settings",
                lazy: async () => {
                    const { SettingsPage } = await import("@/pages/SettingsPage");
                    return { Component: SettingsPage };
                },
            },
            {
                path: "profile",
                lazy: async () => {
                    const { ProfilePage } = await import("@/pages/ProfilePage");
                    return { Component: ProfilePage };
                },
            },

            {
                path: "*",
                element: <div>Страница не найдена</div>,
            },
        ],
    },
];
