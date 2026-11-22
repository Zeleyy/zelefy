import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export interface AudioSink {
    id: string;
    description: string;
    isDefault: boolean;
    isActive: boolean;
}

export const useDevices = () => {
    return useQuery({
        queryKey: ["device", "list"],
        queryFn: async () => {
            return invoke<AudioSink[]>("audio_list_devices");
        },
    });
};
