import { Navigate, type RouteObject } from "react-router";
import type { PlaylistId } from "@/entities/playlist";
import type { TrackId } from "@/entities/track";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { MainLayout } from "@/app/layouts";
import { HydrateFallback } from "../ui";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <MainLayout />,
        HydrateFallback,
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
                path: "track/:trackId",
                loader: ({ params }) => {
                    const raw = params.trackId;
                    if (!raw) throw new Response("Missing track id", { status: 400 });

                    const asNumber = Number(raw);
                    const trackId: TrackId =
                        Number.isFinite(asNumber) && String(asNumber) === raw ? asNumber : raw;

                    return { trackId };
                },
                lazy: async () => {
                    const { TrackPage } = await import("@/pages/TrackPage");
                    return { Component: TrackPage };
                },
            },
            {
                path: "playlist/:playlistId",
                loader: ({ params }) => {
                    const raw = params.playlistId;
                    if (!raw) throw new Response("Missing playlist id", { status: 400 });

                    const asNumber = Number(raw);
                    const playlistId: PlaylistId =
                        Number.isFinite(asNumber) && String(asNumber) === raw ? asNumber : raw;

                    return { playlistId };
                },
                lazy: async () => {
                    const { PlaylistPage } = await import("@/pages/PlaylistPage");
                    return { Component: PlaylistPage };
                },
            },

            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
];
