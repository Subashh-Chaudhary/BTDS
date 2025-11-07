export type CloudinaryConfig = {
    cloud_name?: string;
    api_key?: string;
    api_secret?: string;
    url?: string;
};
declare const _default: (() => CloudinaryConfig) & import("@nestjs/config").ConfigFactoryKeyHost<CloudinaryConfig>;
export default _default;
