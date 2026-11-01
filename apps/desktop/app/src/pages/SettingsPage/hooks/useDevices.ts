import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export interface AudioSink {
    name: string;
    description: string;
    isDefault: boolean;
    isActive: boolean;
}

export const useDevices = () => {
    return useQuery({
        queryKey: ["device", "list"],
        queryFn: async () => {
            return invoke<AudioSink[]>("player_list_devices");
        },
    });
};
