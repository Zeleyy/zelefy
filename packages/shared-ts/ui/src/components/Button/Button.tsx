import styles from "./Button.module.scss";
import React, {
    forwardRef,
    type ElementType,
    type ComponentPropsWithRef,
    type ForwardedRef,
    type CSSProperties,
    type ReactElement,
} from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "small" | "medium" | "large";

interface ColorScheme {
    color?: string;
    colorHover?: string;
    bgColor?: string;
    bgColorHover?: string;
}

interface BaseButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    colorScheme?: ColorScheme;
    fullWidth?: boolean;
    disabled?: boolean;
    square?: boolean;
    noPadding?: boolean;
}

export type ButtonProps<T extends ElementType = "button"> = BaseButtonProps & {
    as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof BaseButtonProps | "as">;

const ButtonInner = <T extends ElementType = "button">(
    {
        children,
        variant = "primary",
        size = "medium",
        colorScheme = {},
        className = "",
        fullWidth = false,
        disabled = false,
        square = false,
        noPadding = false,
        as,
        style,
        ...rest
    }: ButtonProps<T>,
    ref: React.ForwardedRef<any>,
) => {
    const Component = as || "button";

    const baseClassNames = clsx(
        styles.button,
        styles[`button--${variant}`],
        styles[`button--${size}`],
        {
            [styles["button--full-width"]]: fullWidth,
            [styles["button--disabled"]]: disabled,
            [styles["button--square"]]: square,
            [styles["button--no-padding"]]: noPadding,
        },
        typeof className === "string" ? className : undefined,
    );

    const classNames =
        typeof className === "function"
            ? (renderProps: any) => clsx(baseClassNames, className(renderProps))
            : baseClassNames;

    const customStyle = colorScheme
        ? ({
              ...style,
              "--btn-color": colorScheme.color,
              "--btn-color-hover": colorScheme.colorHover,
              "--btn-bg-color": colorScheme.bgColor,
              "--btn-bg-color-hover": colorScheme.bgColorHover,
          } as CSSProperties)
        : style;

    return (
        <Component
            ref={ref}
            className={classNames as any}
            style={customStyle}
            disabled={Component === "button" ? disabled : undefined}
            aria-disabled={Component !== "button" && disabled ? true : undefined}
            {...rest}
        >
            {children}
        </Component>
    );
};

export const Button = forwardRef(ButtonInner) as <T extends ElementType = "button">(
    props: ButtonProps<T> & { ref?: ForwardedRef<any> },
) => ReactElement;
