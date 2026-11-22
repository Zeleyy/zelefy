import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { trackKeys } from "@/entities/track";
import type { Server } from "../model";
import { serverKeys } from "../api";

export const useSwitchServer = () => {
    return useMutation({
        mutationFn: (serverId: number) => invoke<Server>("switch_server", { serverId }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: serverKeys.all });
            await queryClient.invalidateQueries({ queryKey: trackKeys.remoteFeeds() });
        },
    });
};
