import { beforeEach, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import { editAccount, lockAccounts } from './service';

const mocks = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/utils/http', () => ({ default: { post: mocks.post } }));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.post.mockResolvedValue({ success: true });
});

it('新增用户与角色ID通过现有保存请求一次发送，不另发授权请求', async () => {
  await editAccount({
    account: 'newuser',
    locked: '0000',
    roles: [{ id: 'role-b' }],
  });
  expect(mocks.post).toHaveBeenCalledTimes(1);
  expect(mocks.post).toHaveBeenCalledWith(
    APIS.ACCOUNT_EDIT,
    expect.objectContaining({
      code: 'newuser',
      frozen: 0,
      roleIds: ['role-b'],
    }),
  );
});

it('编辑显式清空角色仍发送空ID数组，并保持原锁定状态', async () => {
  await editAccount({
    id: 'user-a',
    account: 'user',
    locked: '0001',
    roles: [],
  });
  expect(mocks.post).toHaveBeenCalledWith(
    APIS.ACCOUNT_EDIT,
    expect.objectContaining({ id: 'user-a', frozen: 1, roleIds: [] }),
  );
});

it('独立锁定沿用已有切换接口，仅发送所选账号ID', async () => {
  await lockAccounts(['user-a'], '0001');
  expect(mocks.post).toHaveBeenCalledWith(APIS.ACCOUNT_LOCK, {
    param: ['user-a'],
  });
});
