import { useMemo } from "react";
import { useLibraries } from "./useLibraries";
import { useLibrariesStats } from "./useLibrariesStats";

export const useLibrariesWithStats = () => {
    const libraries = useLibraries();
    const stats = useLibrariesStats();

    const statsById = useMemo(
        () => new Map((stats.data ?? []).map((s) => [s.libraryId, s])),
        [stats.data],
    );

    const data = useMemo(() => {
        if (!libraries.data) return undefined;
        return libraries.data.map((lib) => {
            const s = statsById.get(lib.libraryId);
            return {
                ...lib,
                filesCount: s?.filesCount ?? 0,
                usedSizeBytes: s?.usedSizeBytes ?? 0,
            };
        });
    }, [libraries.data, statsById]);

    return {
        data,
        isLoading: libraries.isLoading || stats.isLoading,
        isError: libraries.isError || stats.isError,
        error: libraries.error ?? stats.error,
    };
};
