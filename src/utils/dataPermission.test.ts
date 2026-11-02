import { expect, it } from 'vitest';
import { dataPermissionFromResponse } from './dataPermission';

it.each([true, false, undefined, null, 'true', 'false', 0, 1])(
  '数据能力仅接受成功外层布尔值%s',
  (flag) => {
    expect(
      dataPermissionFromResponse({
        success: true,
        dataPermissionEnabled: flag,
      }),
    ).toBe(typeof flag === 'boolean' ? flag : undefined);
    expect(
      dataPermissionFromResponse({
        success: false,
        dataPermissionEnabled: flag,
      }),
    ).toBeUndefined();
    expect(
      dataPermissionFromResponse({ dataPermissionEnabled: flag }),
    ).toBeUndefined();
  },
);
