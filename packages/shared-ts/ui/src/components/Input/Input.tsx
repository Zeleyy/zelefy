import styles from "./Input.module.scss";
import { forwardRef, type ReactNode, type InputHTMLAttributes } from "react";
import clsx from "clsx";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    error?: boolean | string;
    inputSize?: InputSize;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            type = "text",
            error,
            inputSize = "md",
            leftIcon,
            rightIcon,
            className,
            containerClassName,
            disabled,
            ...rest
        },
        ref,
    ) => {
        const isError = Boolean(error);
        const errorMessage = typeof error === "string" ? error : undefined;

        const inputClasses = clsx(
            styles.input,
            styles[`input--${inputSize}`],
            {
                [styles["input--error"]]: isError,
                [styles["input--has-left-icon"]]: Boolean(leftIcon),
                [styles["input--has-right-icon"]]: Boolean(rightIcon),
            },
            className,
        );

        return (
            <div className={clsx(styles.wrapper, containerClassName)}>
                <div className={styles.inputContainer}>
                    {leftIcon && (
                        <span className={clsx(styles.icon, styles["icon--left"])}>{leftIcon}</span>
                    )}

                    <input
                        ref={ref}
                        type={type}
                        disabled={disabled}
                        className={inputClasses}
                        {...rest}
                    />

                    {rightIcon && (
                        <span className={clsx(styles.icon, styles["icon--right"])}>
                            {rightIcon}
                        </span>
                    )}
                </div>

                {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
            </div>
        );
    },
);

Input.displayName = "Input";
