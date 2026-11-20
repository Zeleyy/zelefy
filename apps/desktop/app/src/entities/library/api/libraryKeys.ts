export const libraryKeys = {
    all: ["library"] as const,
    lists: () => [...libraryKeys.all, "list"] as const,
    list: (libraryId: number) => [...libraryKeys.lists(), libraryId] as const,
    stats: () => [...libraryKeys.all, "stats"] as const,
};
