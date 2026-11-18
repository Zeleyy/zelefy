import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@zelefy/ui";

export function NotFoundPage() {
    const { t } = useTranslation();

    return (
        <EmptyState
            title={t("not_found.title")}
            action={
                <Link to="/" replace>
                    {t("not_found.to_home")}
                </Link>
            }
        />
    );
}
