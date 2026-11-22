import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState, Flex, Tabs } from "@zelefy/ui";
import { useSearchStore } from "@/shared/lib/stores";
import { useDebounce } from "@/shared/lib/hooks";
import { useActiveServer } from "@/entities/server";
import { SearchTracks } from "./search-tracks";
import { SearchPlaylists } from "./search-playlists";

export type SearchSource = "all" | "local" | "remote";
type SearchType = "tracks" | "playlists" | "users";

export const SearchPage = () => {
    const { t } = useTranslation();
    const [source, setSource] = useState<SearchSource>("all");
    const [type, setType] = useState<SearchType>("tracks");

    const q = useSearchStore((s) => s.q);
    const debouncedQ = useDebounce(q, 500, "");
    const { data: activeServer } = useActiveServer();

    const trimmedQ = q.trim();
    const trimmedDebouncedQ = debouncedQ.trim();
    const isTyping = trimmedQ !== trimmedDebouncedQ;
    const hasDebouncedQuery = trimmedDebouncedQ.length > 0;

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
                    onTabClick={setSource}
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
                        onTabClick={setType}
                    />
                )}
            </Flex>

            {!trimmedQ ? (
                <EmptyState title={t("search.start")} />
            ) : source === "remote" ? (
                <EmptyState title={t("common.in_development")} />
            ) : (
                <>
                    {type === "tracks" && (
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
                    {type === "users" && <EmptyState title={t("common.in_development")} />}
                </>
            )}
        </Flex>
    );
};
