import { useQuery } from "@tanstack/react-query";

export const useWaveform = (url?: string | null) => {
    return useQuery({
        queryKey: ["waveform", url],
        queryFn: async ({ signal }) => {
            if (!url) throw new Error("Url is required");
            const res = await fetch(url, { signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return new Uint8Array(await res.arrayBuffer());
        },
        enabled: Boolean(url),
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
    });
};
