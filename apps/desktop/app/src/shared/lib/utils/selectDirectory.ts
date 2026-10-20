import { open } from "@tauri-apps/plugin-dialog";

export const selectDirectory = async (defaultPath?: string): Promise<string | null> => {
    try {
        const selected = await open({
            directory: true,
            multiple: false,
            defaultPath,
        });
        return typeof selected === "string" ? selected : null;
    } catch (error) {
        console.error("Ошибка при выборе папки:", error);
        return null;
    }
};
