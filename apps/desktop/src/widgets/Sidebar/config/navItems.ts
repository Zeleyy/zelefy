import { DownloadIcon, HomeIcon, LibraryIcon, SearchIcon } from "@zelefy/ui";

export const navItems = [
    {
        path: "/",
        label: "sidebar.home",
        icon: HomeIcon,
    },
    {
        path: "/search",
        label: "sidebar.search",
        icon: SearchIcon,
    },
    {
        path: "/library",
        label: "sidebar.library",
        icon: LibraryIcon,
    },
    {
        path: "/offline",
        label: "sidebar.offline",
        icon: DownloadIcon,
    },
];
