declare module "*.css" {
    const content: string;
    export default content;
};

interface Window {
    ZOISCORE_STYLES_LOADED: boolean
};