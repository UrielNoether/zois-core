import { Anchor } from "./ui"

export interface Context {
    anchor?: Anchor
    x?: number
    y?: number
    width?: number
    height?: number
    padding?: number
    fontSize?: number | "auto"
    place?: boolean
    element: HTMLElement
}

export type ModuleTarget = HTMLElement | SVGElement;

export abstract class BaseModule {
    overrideProperties(context: Context, target: ModuleTarget): Context {
        return context;
    }
    layoutEffect(context: Context, target: ModuleTarget): void { }
    effect(context: Context, target: ModuleTarget): void { }
}