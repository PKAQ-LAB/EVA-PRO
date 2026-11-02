import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import access from '@/access';
import type { ResourcePermissionUser } from './resourcePermission';
import useMenuAccess from './useMenuAccess';

const state = vi.hoisted(() => ({
  user: undefined as ResourcePermissionUser | undefined,
  loading: false,
  error: undefined as unknown,
}));
vi.mock('@umijs/max', () => ({
  useAccess: () => access({ currentUser: state.user }),
  useModel: () => ({
    initialState: { currentUser: state.user },
    loading: state.loading,
    error: state.error,
  }),
}));
it('Umi Access刷新与身份变更使旧回调失效，新身份不借旧异步授权', () => {
  const user = () => ({
    resourcePermissionEnabled: true,
    menus: [
      {
        id: 'org',
        routeUrl: '/sys/organization',
        resources: ['list', 'update'],
      },
    ],
  });
  state.user = user();
  const view = renderHook(() => useMenuAccess('/sys/organization'));
  const old = view.result.current;
  expect(old('update')).toBe(true);
  expect(old('read')).toBe(false);
  state.loading = true;
  view.rerender();
  expect(old('update')).toBe(false);
  state.loading = false;
  state.user = user();
  view.rerender();
  expect(old('update')).toBe(false);
  expect(view.result.current('update')).toBe(true);
  act(() => {
    state.error = new Error('刷新失败');
    view.rerender();
  });
  expect(view.result.current('update')).toBe(false);
  const current = view.result.current;
  state.error = undefined;
  view.unmount();
  expect(current('update')).toBe(false);
});
