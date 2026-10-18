import { Navigate, type RouteObject } from "react-router";
import { MainLayout } from "@/app/layouts";
import { HomePage } from "@/pages/HomePage";

const HydrateFallback = () => (
    <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
    >
        Loading...
    </div>
);

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <MainLayout />,
        HydrateFallback: HydrateFallback,
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
                children: [
                    {
                        index: true,
                        element: <Navigate to="general" replace />,
                    },
                    {
                        path: "general",
                        lazy: async () => {
                            const { GeneralSettings } = await import("@/pages/SettingsPage");
                            return { Component: GeneralSettings };
                        },
                    },
                    {
                        path: "appearance",
                        lazy: async () => {
                            const { AppearanceSettings } = await import("@/pages/SettingsPage");
                            return { Component: AppearanceSettings };
                        },
                    },
                    {
                        path: "audio",
                        lazy: async () => {
                            const { AudioSettings } = await import("@/pages/SettingsPage");
                            return { Component: AudioSettings };
                        },
                    },
                    {
                        path: "network",
                        lazy: async () => {
                            const { NetworkSettings } = await import("@/pages/SettingsPage");
                            return { Component: NetworkSettings };
                        },
                    },
                    {
                        path: "storage",
                        lazy: async () => {
                            const { StorageSettings } = await import("@/pages/SettingsPage");
                            return { Component: StorageSettings };
                        },
                    },
                ],
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
