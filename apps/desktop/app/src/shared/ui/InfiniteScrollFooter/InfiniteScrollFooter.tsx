import { useInfiniteSentinel } from "@/shared/lib/hooks";
import { Flex, Icon, SpinnerLoader } from "@zelefy/ui";

interface InfiniteScrollFooterProps {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => Promise<unknown> | void;
}

export const InfiniteScrollFooter = ({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}: InfiniteScrollFooterProps) => {
    const sentinelRef = useInfiniteSentinel({
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    });

    return (
        <Flex ref={sentinelRef} align="center" justify="center">
            <SpinnerLoader isLoading={isFetchingNextPage} />
            {!hasNextPage && <Icon name="zelefy" color="var(--text-muted)" size={18} />}
        </Flex>
    );
};
