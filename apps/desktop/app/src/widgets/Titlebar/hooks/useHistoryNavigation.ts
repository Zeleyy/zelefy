import { useCallback, useEffect, useState } from "react";
import { NavigationType, useNavigate, useNavigationType } from "react-router";

const getHistoryIdx = (): number => {
    const rawState: unknown = window.history.state;
    if (
        typeof rawState === "object" &&
        rawState !== null &&
        "idx" in rawState &&
        typeof rawState.idx === "number"
    ) {
        return rawState.idx;
    }
    return 0;
};

export const useHistoryNavigation = () => {
    const navigate = useNavigate();
    const navigationType = useNavigationType();

    const [{ idx, maxIdx }, setHistoryBounds] = useState(() => {
        const initial = getHistoryIdx();
        return { idx: initial, maxIdx: initial };
    });

    const syncFromHistory = useCallback((isPop: boolean) => {
        const nextIdx = getHistoryIdx();
        setHistoryBounds((prev) => ({
            idx: nextIdx,
            maxIdx: isPop ? Math.max(prev.maxIdx, nextIdx) : nextIdx,
        }));
    }, []);

    useEffect(() => {
        const handlePopState = () => syncFromHistory(true);
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [syncFromHistory]);

    useEffect(() => {
        const isPop = navigationType === NavigationType.Pop;
        const timerId = window.setTimeout(() => {
            syncFromHistory(isPop);
        }, 0);
        return () => window.clearTimeout(timerId);
    }, [navigationType, syncFromHistory]);

    return {
        canGoBack: idx > 0,
        canGoForward: idx < maxIdx,
        goBack: () => navigate(-1),
        goForward: () => navigate(1),
    };
};
