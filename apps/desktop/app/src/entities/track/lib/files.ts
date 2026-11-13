import { convertFileSrc } from "@tauri-apps/api/core";
import type { TrackFileResponse } from "../model";

export const trackFilePath = (file?: TrackFileResponse | null): string | null =>
    file ? `${file.library.path}/${file.path}` : null;

export const toSrc = (path?: string | null): string | null => (path ? convertFileSrc(path) : null);

export const trackFileSrc = (file?: TrackFileResponse | null): string | null =>
    toSrc(trackFilePath(file));
