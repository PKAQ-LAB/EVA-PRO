import { act, renderHook } from '@testing-library/react';
import { history } from '@umijs/max';
import { App } from 'antd';
import { beforeEach, expect, it, vi } from 'vitest';
import useLeaveGuard from './useLeaveGuard';

vi.mock('@umijs/max', async () => {
  const { createHistory } = await import('@@/core/history');
  return {
    history: createHistory({
      type: 'memory',
      initialEntries: ['/sys/account'],
    }),
  };
});
beforeEach(() => {
  history.replace('/sys/account');
});
const unload = () => {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
};
const show = (
  initial = { identity: 'edit:user-a', dirty: true, busy: false },
) => {
  let busyNow = initial.busy;
  const onClose = vi.fn();
  const onClean = vi.fn();
  const onBlocked = vi.fn();
  const view = renderHook(
    (props) => {
      const { modal } = App.useApp();
      return {
        modal,
        guard: useLeaveGuard({
          ...props,
          isBusy: () => busyNow,
          onClose,
          onClean,
          onBlocked,
          modal,
        }),
      };
    },
    { initialProps: initial, wrapper: App },
  );
  return {
    ...view,
    onClose,
    onClean,
    onBlocked,
    setBusy: (busy: boolean) => {
      busyNow = busy;
    },
  };
};

it('实际history菜单跳转被阻止，继续编辑保持阻断，确认放弃后解绑并重试原跳转', () => {
  const view = show();
  const confirm = vi.spyOn(view.result.current.modal, 'confirm');
  expect(unload()).toBe(true);
  act(() => history.push('/sys/role'));
  expect(history.location.pathname).toBe('/sys/account');
  act(() => {
    confirm.mock.calls[0][0].onCancel?.();
  });
  expect(unload()).toBe(true);
  act(() => history.push('/sys/module'));
  expect(history.location.pathname).toBe('/sys/account');
  act(() => {
    confirm.mock.calls[1][0].onOk?.();
  });
  expect(history.location.pathname).toBe('/sys/module');
  expect(unload()).toBe(false);
  expect(view.onClean).toHaveBeenCalledTimes(1);
  confirm.mockRestore();
  view.unmount();
});

it('干净/保存后/卸载均无阻断，其他页面可正常离开', () => {
  const clean = show({ identity: 'create:', dirty: false, busy: false });
  expect(unload()).toBe(false);
  act(() => history.push('/sys/role'));
  expect(history.location.pathname).toBe('/sys/role');
  clean.unmount();
  const saved = show();
  expect(unload()).toBe(true);
  act(() => saved.result.current.guard.release());
  expect(unload()).toBe(false);
  act(() => history.push('/log/biz'));
  expect(history.location.pathname).toBe('/log/biz');
  saved.unmount();
  expect(unload()).toBe(false);
  act(() => history.replace('/sys/organization'));
  expect(history.location.pathname).toBe('/sys/organization');
});

it('确认弹出后上传/保存开始，onOk二次检查不关闭也不执行原路由retry', () => {
  const view = show();
  const confirm = vi.spyOn(view.result.current.modal, 'confirm');
  act(() => history.push('/sys/role'));
  view.setBusy(true);
  act(() => {
    confirm.mock.calls[0][0].onOk?.();
  });
  expect(history.location.pathname).toBe('/sys/account');
  expect(view.onClose).not.toHaveBeenCalled();
  expect(view.onClean).not.toHaveBeenCalled();
  expect(view.onBlocked).toHaveBeenCalledTimes(1);
  expect(unload()).toBe(true);
  confirm.mockRestore();
  view.unmount();
});

it('上传期间阻止路由、刷新和关闭，结束后恢复确认', () => {
  const view = show({ identity: 'create:', dirty: true, busy: true });
  const confirm = vi.spyOn(view.result.current.modal, 'confirm');
  act(() => {
    history.push('/sys/role');
    view.result.current.guard.requestClose();
  });
  expect(confirm).not.toHaveBeenCalled();
  expect(view.onBlocked).toHaveBeenCalledTimes(2);
  expect(unload()).toBe(true);
  view.setBusy(false);
  view.rerender({ identity: 'create:', dirty: true, busy: false });
  act(() => view.result.current.guard.requestClose());
  expect(confirm).toHaveBeenCalledTimes(1);
  confirm.mockRestore();
  view.unmount();
});

it('切换对象再切回仍拒绝旧确认及旧上传会话，卸载后回调失效', () => {
  const view = show();
  const original = view.result.current.guard;
  const confirm = vi.spyOn(view.result.current.modal, 'confirm');
  act(() => original.requestClose());
  const oldOk = confirm.mock.calls[0][0].onOk;
  view.rerender({ identity: 'edit:user-b', dirty: true, busy: false });
  view.rerender({ identity: 'edit:user-a', dirty: true, busy: false });
  expect(original.isCurrent()).toBe(false);
  act(() => {
    oldOk?.();
  });
  expect(view.onClose).not.toHaveBeenCalled();
  expect(view.onClean).not.toHaveBeenCalled();
  const current = view.result.current.guard;
  confirm.mockRestore();
  view.unmount();
  expect(current.isCurrent()).toBe(false);
  act(() => {
    current.requestClose();
    oldOk?.();
  });
  expect(view.onClose).not.toHaveBeenCalled();
  expect(unload()).toBe(false);
});
