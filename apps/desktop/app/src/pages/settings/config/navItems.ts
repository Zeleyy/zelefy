import { type IconName } from "@zelefy/ui";

export const navItems: {
    path: string;
    label: string;
    icon: IconName;
}[] = [
    {
        path: "/settings/general",
        label: "settings.general.title",
        icon: "common-globe",
    },
    {
        path: "/settings/appearance",
        label: "settings.appearance.title",
        icon: "common-sparkles",
    },
    {
        path: "/settings/audio",
        label: "settings.audio.title",
        icon: "common-headphones",
    },
    {
        path: "/settings/network",
        label: "settings.network.title",
        icon: "common-cloud",
    },
    {
        path: "/settings/storage",
        label: "settings.storage.title",
        icon: "common-database",
    },
];
