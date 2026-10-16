import type { SVGAttributes } from "react";
import type { IconName } from "../../../generated/icon-names";
import spriteUrl from "../../../generated/sprite.svg?no-inline";

export type { IconName };

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, "name"> {
    name: IconName;
    size?: string | number;
}

export const Icon = ({ name, size = 24, width, height, ...props }: IconProps) => (
    <svg
        width={width ?? size}
        height={height ?? size}
        aria-hidden={props["aria-label"] ? undefined : true}
        focusable="false"
        {...props}
    >
        <use href={`${spriteUrl}#${name.replace(/\//g, "-")}`} />
    </svg>
);
