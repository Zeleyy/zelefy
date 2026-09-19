import { load } from "@tauri-apps/plugin-store";

const defaultSettings = {
    theme: "dark",
    colorScheme: "orange",
    language: "ru",
    pageAnimations: true,
};

export const storage = await load("config.json", {
    autoSave: true,
    defaults: defaultSettings,
});
