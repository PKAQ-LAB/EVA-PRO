import { describe, expect, it } from 'vitest';
import {
  canInspectPlatformTenants,
  PLATFORM_TENANT_INSPECT,
  PRODUCT_MODE,
} from './productMode';

describe('plat product mode', () => {
  it('declares plat mode explicitly', () => {
    expect(PRODUCT_MODE).toBe('plat');
  });

  it('allows only users with the platform tenant inspect capability', () => {
    expect(
      canInspectPlatformTenants({ capabilities: [PLATFORM_TENANT_INSPECT] }),
    ).toBe(true);
    expect(canInspectPlatformTenants({ capabilities: [] })).toBe(false);
    expect(canInspectPlatformTenants(undefined)).toBe(false);
  });
});
