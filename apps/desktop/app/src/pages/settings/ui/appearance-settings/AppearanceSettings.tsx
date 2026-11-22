import { useTranslation } from "react-i18next";
import { Flex } from "@zelefy/ui";
import { Theme, useSettingsStore } from "@/shared/lib/stores";
import { SettingsGroupTitle, SettingsSection } from "@/widgets/sections";
import { ThemePreview } from "./theme-preview";

export const AppearanceSettings = () => {
    const { t } = useTranslation();
    const currentTheme = useSettingsStore((s) => s.theme);
    const setTheme = useSettingsStore((s) => s.setTheme);

    return (
        <>
            <h1>{t("settings.appearance.title")}</h1>

            <SettingsSection
                icon="common-sparkles"
                title={t("settings.appearance.appearance.title")}
            >
                <SettingsGroupTitle title={t("settings.appearance.appearance.theme.title")}>
                    <Flex gap="xs">
                        {Object.values(Theme).map((theme) => (
                            <ThemePreview
                                key={theme}
                                theme={theme}
                                isActive={currentTheme === theme}
                                onSelect={setTheme}
                                title={t(`settings.appearance.appearance.theme.${theme}`)}
                            />
                        ))}
                    </Flex>
                </SettingsGroupTitle>
            </SettingsSection>
        </>
    );
};
