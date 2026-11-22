import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import type { NewServer } from "../model";
import { serverKeys } from "../api";

export const useAddServer = () => {
    return useMutation({
        mutationFn: (newServer: NewServer) => invoke<number>("add_server", { newServer }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: serverKeys.lists() });
        },
    });
};
