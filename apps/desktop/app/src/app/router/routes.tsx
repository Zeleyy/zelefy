import { redirect, type RouteObject } from "react-router";
import type { TrackId } from "@zelefy/types";
import type { PlaylistId } from "@/entities/playlist";
import { HomePage } from "@/pages/home";
import { NotFoundPage } from "@/pages/not-found";
import { MainLayout } from "../layouts";
import { HydrateFallback } from "./hydrate-fallback";
import { SearchTracks } from "@/pages/search/ui/search-tracks";
import { SearchPlaylists } from "@/pages/search/ui/search-playlists";
import { SearchUsers } from "@/pages/search/ui/search-users";

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
                    const { SearchPage } = await import("@/pages/search");
                    return { Component: SearchPage };
                },
                children: [
                    {
                        index: true,
                        loader: () => redirect("tracks"),
                    },
                    { path: "tracks", element: <SearchTracks /> },
                    { path: "playlists", element: <SearchPlaylists /> },
                    { path: "users", element: <SearchUsers /> },
                ],
            },
            {
                path: "library",
                lazy: async () => {
                    const { LibraryPage } = await import("@/pages/library");
                    return { Component: LibraryPage };
                },
            },
            {
                path: "offline",
                lazy: async () => {
                    const { OfflinePage } = await import("@/pages/offline");
                    return { Component: OfflinePage };
                },
            },
            {
                path: "settings",
                lazy: async () => {
                    const { SettingsPage } = await import("@/pages/settings");
                    return { Component: SettingsPage };
                },
                children: [
                    {
                        index: true,
                        loader: () => redirect("general"),
                    },
                    {
                        path: "general",
                        lazy: async () => {
                            const { GeneralSettings } = await import("@/pages/settings");
                            return { Component: GeneralSettings };
                        },
                    },
                    {
                        path: "appearance",
                        lazy: async () => {
                            const { AppearanceSettings } = await import("@/pages/settings");
                            return { Component: AppearanceSettings };
                        },
                    },
                    {
                        path: "audio",
                        lazy: async () => {
                            const { AudioSettings } = await import("@/pages/settings");
                            return { Component: AudioSettings };
                        },
                    },
                    {
                        path: "network",
                        lazy: async () => {
                            const { NetworkSettings } = await import("@/pages/settings");
                            return { Component: NetworkSettings };
                        },
                    },
                    {
                        path: "storage",
                        lazy: async () => {
                            const { StorageSettings } = await import("@/pages/settings");
                            return { Component: StorageSettings };
                        },
                    },
                ],
            },
            {
                path: "profile",
                lazy: async () => {
                    const { ProfilePage } = await import("@/pages/profile");
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
                    const { TrackPage } = await import("@/pages/track");
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
                    const { PlaylistPage } = await import("@/pages/playlist");
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
