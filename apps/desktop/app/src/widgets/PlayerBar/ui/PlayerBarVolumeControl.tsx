import { useSettingsStore } from "@/shared/lib/stores";
import { VolumeControl } from "@zelefy/ui";

export const PlayerBarVolumeControl = () => {
    const isMuted = useSettingsStore((state) => state.isMuted);
    const volume = useSettingsStore((state) => state.volume);
    const setVolume = useSettingsStore((state) => state.setVolume);
    const setIsMuted = useSettingsStore((state) => state.setIsMuted);

    return (
        <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onChange={(newVolume) => {
                setVolume(newVolume);
                if (isMuted && newVolume > 0) {
                    setIsMuted(false);
                }
            }}
            onToggleMute={() => setIsMuted(!isMuted)}
        />
    );
};
