import { queryClient } from "@/shared/api";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export const useSwitchDevice = () => {
    return useMutation({
        mutationFn: (deviceId?: string) => invoke("audio_switch_device", { deviceId }),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["device"] });
        },
    });
};
