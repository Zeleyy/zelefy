const SIZES = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

export const formatBytes = (bytes: number, decimals: number = 1) => {
    if (!Number.isFinite(bytes) || bytes === 0) return "0 B";

    const safeDecimals = Math.max(0, Math.min(20, Math.floor(decimals)));
    const abs = Math.abs(bytes);

    const k = 1024;
    const i = Math.min(Math.floor(Math.log(abs) / Math.log(k)), SIZES.length - 1);

    const value = (abs / Math.pow(k, i)).toFixed(safeDecimals);
    const trimmed = parseFloat(value);

    return `${bytes < 0 ? "-" : ""}${trimmed} ${SIZES[i]}`;
};
