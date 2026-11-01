import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

export const useHistoryNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [idx, setIdx] = useState(0);
    const maxIdx = useRef(0);

    useEffect(() => {
        const stateIdx = (window.history.state?.idx as number) ?? 0;
        setIdx(stateIdx);
        maxIdx.current = Math.max(maxIdx.current, stateIdx);
    }, [location]);

    return {
        canGoBack: idx > 0,
        canGoForward: idx < maxIdx.current,
        goBack: () => navigate(-1),
        goForward: () => navigate(1),
    };
};
