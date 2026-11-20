export const jobKeys = {
    all: ["job"] as const,
    feeds: () => [...jobKeys.all, "feed"] as const,
};
