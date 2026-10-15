import { useTranslation } from "react-i18next";

export const StorageSettings = () => {
    const { t } = useTranslation();

    return (
        <>
            <h1>{t("settings.storage.title")}</h1>
        </>
    );
};
