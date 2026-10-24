import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { LocalTrack } from "../types";

export type ImportOutcome =
    | { status: "imported"; path: string; track: LocalTrack }
    | { status: "failed"; path: string; error: string };

type ImportVariables = {
    paths: string[];
    libraryId?: number;
};

type ImportProgress = { done: number; total: number };

export const useImportTracks = () => {
    const queryClient = useQueryClient();
    const [progress, setProgress] = useState<ImportProgress | null>(null);

    useEffect(() => {
        const unlisten = listen<[number, number]>("import-progress", (event) => {
            const [done, total] = event.payload;
            setProgress({ done, total });
        });
        return () => {
            unlisten.then((fn) => fn());
        };
    }, []);

    const mutation = useMutation({
        mutationFn: ({ paths, libraryId }: ImportVariables) =>
            invoke<ImportOutcome[]>("import_tracks", { paths, libraryId }),
        onSettled: () => {
            setProgress(null);
            queryClient.invalidateQueries({ queryKey: ["track"] });
        },
    });

    return { ...mutation, progress };
};
