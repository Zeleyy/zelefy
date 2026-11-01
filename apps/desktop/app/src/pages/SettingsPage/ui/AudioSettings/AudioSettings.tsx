import { useTranslation } from "react-i18next";
import { Select } from "@zelefy/ui";
import { SettingsSection } from "@/widgets/sections";
import { useDevices } from "../../hooks";

export const AudioSettings = () => {
    const { t } = useTranslation();
    const { data: devices = [] } = useDevices();

    const options = devices.map((device) => ({ value: device.name, label: device.description }));

    const activeDevice =
        devices.find((d) => d.isActive) ?? devices.find((d) => d.isDefault) ?? devices[0];

    return (
        <>
            <h1>{t("settings.audio.title")}</h1>

            <SettingsSection title={t("settings.audio.output.title")}>
                <Select options={options} value={activeDevice?.name} onChange={() => {}} />
            </SettingsSection>
        </>
    );
};
