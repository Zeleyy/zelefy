import { useTranslation } from "react-i18next";
import { EmptyState } from "@zelefy/ui";

export const SearchUsers = () => {
    const { t } = useTranslation();

    return <EmptyState title={t("common.in_development")} />;
};
