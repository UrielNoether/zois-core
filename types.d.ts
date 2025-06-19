declare module "*.css" {
    const content: string;
    export default content;
};
declare module "*.png";
declare module "*.svg";

interface Window {
    ZOISCORE: {
        loaded: boolean
        useToastsStore: import("zustand").UseBoundStore<import("zustand").StoreApi<import("@/popups").ToastsStore>>
        useDialogStore: import("zustand").UseBoundStore<import("zustand").StoreApi<import("@/popups").DialogStore>>
    }
};