import { invoke } from "@tauri-apps/api/core";

export const invokeTry = async <T>(
    cmd: string,
    args: Record<string, unknown>,
    onError: string,
): Promise<T | null> => {
    try {
        return await invoke<T>(cmd, args);
    } catch (error) {
        console.error(onError, error);
        return null;
    }
};
