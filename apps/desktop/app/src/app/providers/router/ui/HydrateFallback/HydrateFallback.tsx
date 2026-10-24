import { SpinnerLoader } from "@zelefy/ui";

export const HydrateFallback = () => (
    <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
    >
        <SpinnerLoader size="large" isLoading />
    </div>
);
