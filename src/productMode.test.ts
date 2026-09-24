import { describe, expect, it } from 'vitest';
import {
  canInspectPlatformTenants,
  PLATFORM_TENANT_INSPECT,
  PRODUCT_MODE,
} from './productMode';

describe('standalone product mode', () => {
  it('declares standalone mode explicitly', () => {
    expect(PRODUCT_MODE).toBe('standalone');
  });

  it('never enables platform tenant inspection', () => {
    expect(
      canInspectPlatformTenants({ capabilities: [PLATFORM_TENANT_INSPECT] }),
    ).toBe(false);
  });
});
