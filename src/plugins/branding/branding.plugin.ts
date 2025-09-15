import { VendurePlugin } from '@vendure/core';

@VendurePlugin({
    dashboard: './dashboard/index.tsx',
    compatibility: '^3.0.0',
})
export class BrandingPlugin {}
