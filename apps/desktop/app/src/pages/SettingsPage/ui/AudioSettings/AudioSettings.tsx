import { useTranslation } from "react-i18next";

export const AudioSettings = () => {
    const { t } = useTranslation();

    return <h1>{t("settings.audio.title")}</h1>;
};
