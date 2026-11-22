export const serverKeys = {
    all: ["server"] as const,
    lists: () => [...serverKeys.all, "list"] as const,
    active: () => [...serverKeys.all, "active"] as const,
    defaultUrl: () => [...serverKeys.all, "default-url"] as const,
};
