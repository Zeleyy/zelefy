import { CloudIcon, DatabaseIcon, GlobeIcon, HeadphonesIcon, SparklesIcon } from "@zelefy/ui";

export const navItems = [
    {
        path: "/settings/general",
        label: "settings.general.title",
        icon: GlobeIcon,
    },
    {
        path: "/settings/appearance",
        label: "settings.appearance.title",
        icon: SparklesIcon,
    },
    {
        path: "/settings/audio",
        label: "settings.audio.title",
        icon: HeadphonesIcon,
    },
    {
        path: "/settings/network",
        label: "settings.network.title",
        icon: CloudIcon,
    },
    {
        path: "/settings/storage",
        label: "settings.storage.title",
        icon: DatabaseIcon,
    },
];
