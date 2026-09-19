type CSSModuleClasses = { readonly [key: string]: string };

declare module "*.module.scss" {
    const classes: CSSModuleClasses;
    export default classes;
}
declare module "*.module.sass" {
    const classes: CSSModuleClasses;
    export default classes;
}

declare module "*.svg?react" {
    import type { FC, SVGProps } from "react";
    const ReactComponent: FC<SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}
