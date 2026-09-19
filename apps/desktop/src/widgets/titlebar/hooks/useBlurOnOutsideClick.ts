import { useCallback, type MouseEvent } from "react";

export const useBlurOnOutsideClick = () => {
    return useCallback((e: MouseEvent<HTMLElement>) => {
        const activeEl = document.activeElement;

        if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) {
            const target = e.target as HTMLElement;

            if (!target.closest("input, textarea")) {
                activeEl.blur();
            }
        }
    }, []);
};
