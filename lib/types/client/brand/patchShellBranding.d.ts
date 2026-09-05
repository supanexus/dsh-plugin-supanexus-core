/** Browser tab title + favicon overrides for Supanexus Harness. */
export declare const PRODUCT_TITLE = "Supanexus Harness";
/** Inline SupaNexus mark used as the browser tab favicon. */
export declare const FAVICON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><rect width=\"512\" height=\"512\" fill=\"#1212F9\"/><g transform=\"translate(256,256) scale(0.72) translate(-297.65,-244)\"><path fill=\"white\" d=\"M135.1,158.8c4-24.7,21-37.9,41.6-49.1c30.1-16.4,59.7-33.8,89.1-51.4c20.9-12.5,41.1-12.2,61.9,0c32.9,19.3,66,38.4,99.2,57.2c17.4,9.9,29.5,23.1,31.8,45.1c0.6,15.9,1,30.5,1.4,45.1c-2.6-0.5-5.5-0.3-7.7-1.5c-9.5-5.1-19.1-10.2-28-16.3c-3.4-2.3-6.5-6.9-7.1-10.9c-2-13.3-8.3-23.7-19.5-30.4c-27.3-16.2-54.9-32.1-82.7-47.5c-11.9-6.6-24.9-6.5-36.7,0.1c-27.8,15.5-55.3,31.5-82.8,47.5c-26.4,15.3-25,62.9,0.1,77.5c27.7,16.1,55.3,32.6,83.4,48.1c15,8.3,30.5,5.3,44.1-4c10-6.8,18.2-7.7,28.2-0.1c7.6,5.8,16.5,9.8,24.4,14.4c-0.3,1.7-0.3,2.5-0.6,2.7c-19.9,11.4-39.4,23.5-59.9,33.7c-16.6,8.3-33,2.9-48.2-5.9c-33.5-19.4-66.9-39-100.6-58.2c-17-9.7-28-23.1-30.9-44C135.3,192.7,135.2,175.8,135.1,158.8z\"/><path fill=\"white\" d=\"M431.4,360.9c-36,20.8-71.4,41.4-107,61.7c-17.1,9.8-34.9,10.5-52.3,0.6c-37-21.1-74-42.4-110.8-64c-16-9.4-24.4-23.8-24.4-42.6c0-13.5,0-27,0-42.8c9.6,5.3,17.3,9.8,25.3,13.8c8.9,4.5,14.7,10.1,15.7,21.2c1,11.3,9.1,19.6,18.7,25.2c26.9,15.9,54,31.6,81.3,46.8c12.7,7.1,26.2,7.2,39,0c26.8-15,53.5-30.3,80.1-45.7c30-17.3,28.3-67-1.4-82.9c-26.1-14-51.3-29.7-77.1-44.2c-16-9-32.5-7.8-47.2,2.4c-10.6,7.3-19.3,6.8-29.2-0.4c-6.8-5-14.5-8.8-23.1-13.8c3.3-2.5,5.2-4.4,7.4-5.7c15.4-8.8,30.7-17.7,46.2-26.2c16-8.8,32.6-9,48.4,0c36.4,20.6,72.5,41.6,108.7,62.6c18.6,10.7,28.3,26.6,28,48.4c-0.2,13.6,0,27.2-0.1,40.7C457.4,335.6,448.5,350.4,431.4,360.9z\"/></g></svg>";
/** Keep the browser tab title on the Supanexus product name. */
export declare function patchDocumentProductTitle(): void;
/** Replace the default DSH favicon with the SupaNexus mark. */
export declare function patchFavicon(): void;
/** Apply browser-tab-only branding patches. */
export declare function patchTabBranding(): void;
/** Restore pre-SupaNexus tab title / favicon (DSH defaults). */
export declare function clearTabBranding(): void;
/** Keep the tab title and favicon in sync with framework updates. */
export declare function watchTabBrandingPatches(): () => void;
//# sourceMappingURL=patchShellBranding.d.ts.map