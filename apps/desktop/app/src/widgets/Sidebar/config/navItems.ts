import { type IconName } from "@zelefy/ui";

export const navItems: {
    path: string;
    label: string;
    icon: IconName;
}[] = [
    {
        path: "/",
        label: "sidebar.home",
        icon: "common-home",
    },
    {
        path: "/search",
        label: "sidebar.search",
        icon: "common-search",
    },
    {
        path: "/library",
        label: "sidebar.library",
        icon: "common-library",
    },
    {
        path: "/offline",
        label: "sidebar.offline",
        icon: "common-download",
    },
];
