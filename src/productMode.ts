export type ProductMode = 'plat' | 'standalone';

export const PRODUCT_MODE: ProductMode = 'standalone';

export const PLATFORM_TENANT_INSPECT = 'PLATFORM_TENANT_INSPECT';

export const canInspectPlatformTenants = (_currentUser: unknown): boolean =>
  false;
