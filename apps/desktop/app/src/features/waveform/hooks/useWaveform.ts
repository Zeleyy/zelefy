import { useQuery } from "@tanstack/react-query";
import { convertFileSrc } from "@tauri-apps/api/core";

export const useWaveform = (path: string) => {
    return useQuery({
        queryKey: ["waveform", path],
        queryFn: async ({ signal }) => {
            const url = convertFileSrc(path);
            const res = await fetch(url, { signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return new Uint8Array(await res.arrayBuffer());
        },
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
    });
};
