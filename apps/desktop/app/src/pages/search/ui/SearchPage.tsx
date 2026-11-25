import { useTranslation } from "react-i18next";
import { Outlet, useMatch, useNavigate, useSearchParams } from "react-router";
import { EmptyState, Flex, Tabs } from "@zelefy/ui";
import { useSearchStore } from "@/shared/lib/stores";
import { useDebounce } from "@/shared/lib/hooks";
import { useActiveServer } from "@/entities/server";

export type SearchSource = "all" | "local" | "remote";

const SEARCH_TYPES = ["tracks", "playlists", "users"] as const;
type SearchType = (typeof SEARCH_TYPES)[number];

const isSearchType = (v: string | undefined): v is SearchType =>
    SEARCH_TYPES.includes(v as SearchType);

const parseSource = (v: string | null): SearchSource =>
    v === "local" || v === "remote" ? v : "all";

export const SearchPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();

    const typeParam = useMatch("/search/:type")?.params.type;
    const type: SearchType = isSearchType(typeParam) ? typeParam : "tracks";
    const source = parseSource(params.get("source"));

    const q = useSearchStore((s) => s.q);
    const debouncedQ = useDebounce(q, 500, "");
    const { data: activeServer } = useActiveServer();

    const trimmedQ = q.trim();
    const trimmedDebouncedQ = debouncedQ.trim();
    const isTyping = trimmedQ !== trimmedDebouncedQ;
    const hasDebouncedQuery = trimmedDebouncedQ.length > 0;

    const handleSourceChange = (next: SearchSource) =>
        setParams(
            (prev) => {
                if (next === "all") prev.delete("source");
                else prev.set("source", next);
                return prev;
            },
            { replace: true },
        );

    const handleTypeChange = (next: SearchType) =>
        navigate({ pathname: `/search/${next}`, search: params.toString() });

    return (
        <Flex direction="column" align="center" gap="lg">
            <Flex direction="column" align="center" gap="xs">
                <Tabs<SearchSource>
                    tabs={[
                        { label: t("search.source.all"), value: "all" },
                        { label: t("search.source.local"), value: "local" },
                        { label: activeServer?.serverName ?? "", value: "remote" },
                    ]}
                    active={source}
                    onTabClick={handleSourceChange}
                />

                {hasDebouncedQuery && source !== "remote" && (
                    <Tabs<SearchType>
                        variant="primary"
                        shape="underline"
                        tabs={[
                            { label: t("search.type.tracks"), value: "tracks" },
                            { label: t("search.type.playlists"), value: "playlists" },
                            { label: t("search.type.users"), value: "users" },
                        ]}
                        active={type}
                        onTabClick={(value) => void handleTypeChange(value)}
                    />
                )}
            </Flex>

            {!trimmedQ ? (
                <EmptyState title={t("search.start")} />
            ) : source === "remote" ? (
                <EmptyState title={t("common.in_development")} />
            ) : (
                <>
                    <Outlet context={{ query: trimmedDebouncedQ, source, isTyping }} />
                    {/* {type === "tracks" && (
                        <SearchTracks
                            query={trimmedDebouncedQ}
                            source={source}
                            isTyping={isTyping}
                        />
                    )}
                    {type === "playlists" && (
                        <SearchPlaylists
                            query={trimmedDebouncedQ}
                            source={source}
                            isTyping={isTyping}
                        />
                    )}
                    {type === "users" && <EmptyState title={t("common.in_development")} />} */}
                </>
            )}
        </Flex>
    );
};
