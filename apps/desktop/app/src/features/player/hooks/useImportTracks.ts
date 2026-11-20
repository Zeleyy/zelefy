import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Channel, invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { trackKeys, type LocalTrack } from "@/entities/track";

export type ImportOutcome =
    | { status: "imported"; path: string; track: LocalTrack }
    | { status: "failed"; path: string; error: string };

type ImportVariables = {
    paths: string[];
    libraryId?: number;
};

type ImportProgress = { done: number; total: number };

export const useImportTracks = () => {
    const [progress, setProgress] = useState<ImportProgress | null>(null);

    const mutation = useMutation({
        mutationFn: ({ paths, libraryId }: ImportVariables) => {
            const onProgress = new Channel<[number, number]>();
            onProgress.onmessage = ([done, total]) => {
                setProgress({ done, total });
            };
            return invoke<ImportOutcome[]>("import_tracks", { paths, libraryId, onProgress });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: trackKeys.all });
        },
        onSettled: () => {
            setProgress(null);
        },
    });

    return { ...mutation, progress };
};
