import { useCallback, type ChangeEvent, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { Icon, Input } from "@zelefy/ui";
import { MIN_QUERY_LENGTH, useSearchHistoryStore, useSearchStore } from "@/shared/lib/stores";

const SEARCH_PATH = "/search";

export const Search = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const q = useSearchStore((s) => s.q);
    const setQ = useSearchStore((s) => s.setQ);
    // const history = useSearchHistoryStore((s) => s.queries);
    // const removeQuery = useSearchHistoryStore((s) => s.removeQuery);
    // const clearHistory = useSearchHistoryStore((s) => s.clearHistory);
    const addQuery = useSearchHistoryStore((s) => s.addQuery);

    const goSearch = useCallback(() => {
        if (pathname !== SEARCH_PATH) void navigate(SEARCH_PATH);
    }, [pathname, navigate]);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setQ(value);
            if (value) goSearch();
        },
        [setQ, goSearch],
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                if (q.trim().length >= MIN_QUERY_LENGTH) addQuery(q);
                goSearch();
                e.currentTarget.blur();
            } else if (e.key === "Escape") {
                e.currentTarget.blur();
            }
        },
        [q, goSearch, addQuery],
    );

    return (
        <div style={{ flex: 1, maxWidth: 600 }} data-tauri-drag-region>
            <Input
                id="titlebar-search"
                name="search"
                placeholder={t("titlebar.search_placeholder")}
                leftIcon={<Icon name="common-search" width={17} height={17} />}
                value={q}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};
