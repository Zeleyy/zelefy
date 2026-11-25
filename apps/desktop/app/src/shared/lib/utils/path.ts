import { convertFileSrc } from "@tauri-apps/api/core";

export const toSrc = (path?: string | null): string | null => (path ? convertFileSrc(path) : null);
