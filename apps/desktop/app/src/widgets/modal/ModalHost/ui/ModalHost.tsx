import { Suspense, type ComponentType } from "react";
import { useModalStore } from "@/shared/lib/stores";
import { modalRegistry } from "../model";
import { SpinnerLoader } from "@zelefy/ui";

export const ModalHost = () => {
    const stack = useModalStore((s) => s.stack);
    const closeModal = useModalStore((s) => s.closeModal);

    return (
        <Suspense
            fallback={
                <div
                    style={{
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        inset: 0,
                        backgroundColor: "var(--backdrop)",
                    }}
                >
                    <SpinnerLoader isLoading />
                </div>
            }
        >
            {stack.map(({ id, name, props }) => {
                const Component = modalRegistry[name] as ComponentType<any>;
                return <Component key={id} {...props} onClose={() => closeModal(id)} />;
            })}
        </Suspense>
    );
};
