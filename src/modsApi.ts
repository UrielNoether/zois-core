import bcModSdk, { PatchHook, ModSDKModInfo, GetDotedPathType, ModSDKModAPI } from "bondage-club-mod-sdk";
import { getPlayer, MOD_DATA } from "./index";
import { getCurrentSubscreen } from "./ui";
import { handleRequest, handleRequestResponse } from "./messaging";

export enum HookPriority {
    OBSERVE = 0,
    ADD_BEHAVIOR = 1,
    MODIFY_BEHAVIOR = 5,
    OVERRIDE_BEHAVIOR = 10,
    TOP = 100
}

let modSdk: ModSDKModAPI;

export function registerMod(): void {
    modSdk = bcModSdk.registerMod({
        name: MOD_DATA.name,
        fullName: MOD_DATA.fullName,
        version: MOD_DATA.version,
        repository: MOD_DATA.repository
    });

    hookFunction("GameKeyDown", HookPriority.ADD_BEHAVIOR, (args, next) => {
        if (CommonKey.IsPressed(args[0], "Escape") && getCurrentSubscreen()) getCurrentSubscreen().exit();
        return next(args);
    });

    hookFunction("ChatRoomMessage", HookPriority.ADD_BEHAVIOR, (args, next) => {
        const message = args[0];
        const sender = getPlayer(message.Sender);
        if (!sender) return next(args);
        if (message.Content === MOD_DATA.key && !sender.IsPlayer()) {
            const msg = message.Dictionary.msg;
            const data = message.Dictionary.data;
            if (msg === "request") {
                if (typeof data.requestId !== "number" || typeof data.message !== "string") return;
                handleRequest(data.requestId, data.message, data.data, sender);
            }
            if (msg === "requestResponse") {
                if (typeof data.requestId !== "number") return;
                handleRequestResponse(data.requestId, data.data);
            }
        }
        return next(args);
    });
}

export function hookFunction(functionName: string, priority: HookPriority, hook: PatchHook): () => void {
    if (!modSdk) throw new Error("zois-core is not registered");
    return modSdk.hookFunction(functionName, priority, hook);
}

export function patchFunction(functionName: string, patches: Record<string, string | null>): void {
    if (!modSdk) throw new Error("zois-core is not registered");
    modSdk.patchFunction(functionName, patches);
}

export function callOriginal<TFunctionName extends string>(
    target: TFunctionName,
    args: [...Parameters<GetDotedPathType<typeof globalThis, TFunctionName>>],
    context?: any
): ReturnType<GetDotedPathType<typeof globalThis, TFunctionName>> {
    if (!modSdk) throw new Error("zois-core is not registered");
    return modSdk.callOriginal(target, args);
}

export function getLoadedMods(): ModSDKModInfo[] {
    return bcModSdk.getModsInfo();
}

export function findModByName(name: string): boolean {
    return !!bcModSdk.getModsInfo().find((m) => m.name === name);
}