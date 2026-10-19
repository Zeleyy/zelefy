import { load } from "@tauri-apps/plugin-store";

export const storage = await load("config.json", {
    autoSave: false,
});
