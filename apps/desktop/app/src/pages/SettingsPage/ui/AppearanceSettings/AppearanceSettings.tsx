import { useTranslation } from "react-i18next";

export const AppearanceSettings = () => {
    const { t } = useTranslation();

    return <h1>{t("settings.appearance.title")}</h1>;
};
