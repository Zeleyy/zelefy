import type { StateStorage } from "zustand/middleware";
import { storage } from "./storage";

const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};

const debouncedSave = debounce(async () => {
    await storage.save();
}, 500);

export const tauriStorage: StateStorage = {
    getItem: async (name: string) => {
        const value = await storage.get<unknown>(name);
        if (!value) return null;

        return JSON.stringify(value);
    },
    setItem: async (name: string, value: string) => {
        const parsedValue = JSON.parse(value);
        await storage.set(name, parsedValue);

        debouncedSave();
    },
    removeItem: async (name: string) => {
        await storage.delete(name);
        debouncedSave();
    },
};
