import { open } from "@tauri-apps/plugin-dialog";

export const AUDIO_EXTENSIONS = ["mp3", "wav", "flac", "m4a", "aac", "ogg", "wma"] as const;

export const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif", "avif"] as const;

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

type DialogFilter = {
    name: string;
    extensions: string[];
};

export async function selectFiles(
    defaultPath?: string,
    filters: DialogFilter[] = [],
): Promise<string[] | null> {
    try {
        const selected = await open({
            directory: false,
            multiple: true,
            defaultPath,
            filters: [...filters, { name: "All", extensions: ["*"] }],
        });
        return Array.isArray(selected) ? selected : null;
    } catch (error) {
        console.error("Ошибка при выборе файлов:", error);
        return null;
    }
}

export const selectAudio = async (defaultPath?: string): Promise<string[] | null> => {
    return selectFiles(defaultPath, [
        {
            name: "Audio",
            extensions: [...AUDIO_EXTENSIONS],
        },
    ]);
};

export const selectImages = async (defaultPath?: string): Promise<string[] | null> => {
    return selectFiles(defaultPath, [
        {
            name: "Images",
            extensions: [...IMAGE_EXTENSIONS],
        },
    ]);
};
