import styles from "./Flex.module.scss";
import {
    forwardRef,
    type ElementType,
    type ForwardedRef,
    type HTMLAttributes,
    type JSX,
    type ReactNode,
} from "react";
import clsx from "clsx";

type FlexDirection = "row" | "column";
type FlexJustify = "start" | "center" | "space-between" | "flex-end";
type FlexAlign = "stretch" | "center" | "flex-start" | "baseline" | "flex-end";
type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
type FlexGap = "2xs" | "xs" | "sm" | "md" | "lg" | "xl";
type FlexSize =
    | "card-sm"
    | "card-md"
    | "card-lg"
    | "form-sm"
    | "form-md"
    | "form-lg"
    | "page-sm"
    | "page-md"
    | "page-lg"
    | "full";

interface BaseFlexProps {
    direction?: FlexDirection;
    align?: FlexAlign;
    justify?: FlexJustify;
    wrap?: FlexWrap;
    gap?: FlexGap;
    size?: FlexSize;
    container?: boolean;
    mt?: "xs" | "sm" | "md" | "lg" | "xl";
    mb?: "xs" | "sm" | "md" | "lg" | "xl";
    fullWidth?: boolean;
    children?: ReactNode;
}

type FlexProps<T extends ElementType> = BaseFlexProps & {
    as?: T;
} & Omit<HTMLAttributes<HTMLElement>, keyof BaseFlexProps | "as">;

const FlexInner = (
    {
        children,
        direction,
        align,
        justify,
        wrap,
        gap,
        className,
        as,
        size,
        container,
        mt,
        mb,
        fullWidth,
        ...rest
    }: FlexProps<ElementType>,
    ref: ForwardedRef<HTMLElement>,
) => {
    const Component = as || "div";

    const classNames = clsx(
        styles.flex,

        {
            [styles[`flex--direction-${direction}`]]: direction,
            [styles[`flex--justify-${justify}`]]: justify,
            [styles[`flex--align-${align}`]]: align,
            [styles[`flex--wrap-${wrap}`]]: wrap,
            [styles[`flex--gap-${gap}`]]: gap,
            [styles[`flex--${size}`]]: size,
            [styles["flex--container"]]: container,
            [styles[`flex--mt-${mt}`]]: mt,
            [styles[`flex--mb-${mb}`]]: mb,
            [styles["flex--full-width"]]: fullWidth,
        },

        className,
    );

    return (
        <Component className={classNames} ref={ref} {...rest}>
            {children}
        </Component>
    );
};

export const Flex = forwardRef(FlexInner) as <T extends ElementType = "div">(
    props: FlexProps<T> & { ref?: ForwardedRef<HTMLElement> },
) => JSX.Element;
