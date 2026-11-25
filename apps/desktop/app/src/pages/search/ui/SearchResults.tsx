import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState, Flex } from "@zelefy/ui";
import { InfiniteScrollFooter } from "@/shared/ui";

interface SearchResultsProps {
    isLoading: boolean;
    isError: boolean;
    isEmpty: boolean;
    isStale?: boolean;
    errorTitle?: string;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    children: ReactNode;
}

export const SearchResults = ({
    isLoading,
    isError,
    isEmpty,
    isStale,
    errorTitle,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    children,
}: SearchResultsProps) => {
    const { t } = useTranslation();

    return (
        <>
            {isError && <EmptyState title={errorTitle ?? t("search.result.error")} />}

            {!isLoading && !isError && isEmpty && (
                <EmptyState
                    title={t("search.result.empty")}
                    description={t("search.result.empty_description")}
                />
            )}

            {!isEmpty && (
                <Flex
                    direction="column"
                    gap="xs"
                    fullWidth
                    style={{ opacity: isStale ? 0.6 : 1, transition: "opacity 150ms" }}
                >
                    {children}
                </Flex>
            )}

            <InfiniteScrollFooter
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
            />
        </>
    );
};
