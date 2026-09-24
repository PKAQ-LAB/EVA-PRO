export type ProductMode = 'plat' | 'standalone';

export const PRODUCT_MODE: ProductMode = 'plat';

export const PLATFORM_TENANT_INSPECT = 'PLATFORM_TENANT_INSPECT';

interface CapabilityUser {
  capabilities?: unknown;
}

export const canInspectPlatformTenants = (currentUser: unknown): boolean => {
  if (
    PRODUCT_MODE !== 'plat' ||
    !currentUser ||
    typeof currentUser !== 'object'
  ) {
    return false;
  }

  const capabilities = (currentUser as CapabilityUser).capabilities;
  return (
    Array.isArray(capabilities) &&
    capabilities.includes(PLATFORM_TENANT_INSPECT)
  );
};
