import { beforeEach, describe, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import { checkOrgUnique } from './service';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock('@/utils/http', () => ({
  default: {
    get: vi.fn(),
    list: vi.fn(),
    post: mocks.post,
  },
}));

describe('organization service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps parentId to pid for uniqueness checks', async () => {
    mocks.post.mockResolvedValue({ success: true });

    await checkOrgUnique('ORG_CODE', 'parent-id', 'org-id');

    expect(mocks.post).toHaveBeenCalledWith(APIS.ORG_CHECKUNIQUE, {
      id: 'org-id',
      pid: 'parent-id',
      code: 'ORG_CODE',
    });
  });
});
