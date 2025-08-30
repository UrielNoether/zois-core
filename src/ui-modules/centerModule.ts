import { BaseModule, Context } from "../modules";

export class CenterModule extends BaseModule {
    overrideProperties(context: Context) {
        context.element.style.cssText += "transform: translate(-50%, -50%);";
        context.x = 1000;
        context.y = 500;
        return context;
    }
}