import { useTranslation } from "react-i18next";
import { Select } from "@zelefy/ui";
import { SettingsSection } from "@/widgets/sections";
import { useDevices, useSwitchDevice } from "../../hooks";

export const AudioSettings = () => {
    const { t } = useTranslation();
    const { data: devices = [] } = useDevices();
    const { mutate: swtichDevice } = useSwitchDevice();

    const options = devices.map((device) => ({ value: device.id, label: device.description }));

    const activeDevice =
        devices.find((d) => d.isActive) ?? devices.find((d) => d.isDefault) ?? devices[0];

    return (
        <>
            <h1>{t("settings.audio.title")}</h1>

            <SettingsSection title={t("settings.audio.output.title")}>
                <Select
                    options={options}
                    value={activeDevice?.id}
                    onChange={(deviceId) => {
                        swtichDevice(deviceId);
                    }}
                />
            </SettingsSection>
        </>
    );
};
