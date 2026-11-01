import styles from "./InputLabel.module.scss";
import { forwardRef, useId, type ReactNode } from "react";
import clsx from "clsx";
import { Input, type InputProps } from "../Input";

export interface InputLabelProps extends InputProps {
    label: ReactNode;
    labelClassName?: string;
}

export const InputLabel = forwardRef<HTMLInputElement, InputLabelProps>(function InputLabel(
    { id: idProp, label, labelClassName, containerClassName, required, disabled, ...rest },
    ref,
) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
        <div className={clsx(styles.field, containerClassName)}>
            <label
                htmlFor={id}
                className={clsx(
                    styles.label,
                    { [styles["label--disabled"]]: disabled },
                    labelClassName,
                )}
            >
                <span>{label}</span>
                {required && (
                    <span className={styles.required} aria-hidden="true">
                        *
                    </span>
                )}
            </label>

            <Input ref={ref} id={id} required={required} disabled={disabled} {...rest} />
        </div>
    );
});
