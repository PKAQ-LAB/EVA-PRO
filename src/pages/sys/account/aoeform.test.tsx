import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { App, ConfigProvider, Form, theme } from 'antd';
import { MD5 } from 'jscrypto/es6/MD5';
import type { ComponentProps } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import AOEForm from './aoeform';
import type { AccountItem } from './data.d';

vi.mock('@umijs/max', async () => {
  const { createHistory } = await import('@@/core/history');
  return {
    history: createHistory({
      type: 'memory',
      initialEntries: ['/sys/account'],
    }),
  };
});

const mocks = vi.hoisted(() => ({
  checkAccountUnique: vi.fn(),
  editAccount: vi.fn(),
}));
vi.mock('./service', () => ({
  checkAccountUnique: mocks.checkAccountUnique,
  editAccount: mocks.editAccount,
}));

const roles = [
  { id: 'role-a', name: '管理员' },
  { id: 'role-b', name: '业务主管' },
];
const account = {
  id: 'user-a',
  account: 'testuser',
  name: '测试用户',
  deptId: 'dept-a',
  tel: '13800000000',
  email: 'test@example.com',
  roles: [{ id: 'role-a' }],
  locked: '0001' as const,
  frozen: 1 as const,
  password: 'persisted-hash',
};
const change = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const show = (
  props: Partial<ComponentProps<typeof AOEForm>> = {},
  dark = false,
) =>
  render(
    <ConfigProvider
      theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      <App>
        <AOEForm
          operateType="create"
          currentItem={null}
          orgs={[{ id: 'dept-a', title: '测试部门' }]}
          roles={roles}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          {...props}
        />
      </App>
    </ConfigProvider>,
  );
beforeEach(() => {
  vi.clearAllMocks();
  mocks.checkAccountUnique.mockResolvedValue({ success: true });
  mocks.editAccount.mockResolvedValue({ success: true });
});

it.each([false, true])(
  '新增使用真实弹窗/角色表，角色与用户一次保存，主题dark=%s',
  async (dark) => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    show({ onClose, onSuccess }, dark);
    expect(document.querySelector('.ant-modal')).not.toBeNull();
    expect(document.querySelector('.ant-drawer')).toBeNull();
    expect(screen.queryByRole('heading', { name: '角色授权' })).toBeNull();
    expect(screen.getByRole('region', { name: '用户角色' })).toContainElement(
      screen.getByRole('table'),
    );
    expect(screen.queryByLabelText('是否锁定')).toBeNull();
    expect(screen.queryByText(/密码强度/)).toBeNull();
    change(/账号/, 'newuser');
    change('姓名', '新用户');
    fireEvent.mouseDown(screen.getByLabelText('所属部门'));
    fireEvent.click(
      await screen.findByText('测试部门', {
        selector: '.ant-select-tree-title',
      }),
    );
    change('手机号码', '13800000000');
    change('邮箱', 'new@example.com');
    change(/^密码/, 'abc12345');
    change('确认密码', 'abc12345');
    fireEvent.click(screen.getByRole('checkbox', { name: '授权角色业务主管' }));
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
    await waitFor(() => expect(mocks.editAccount).toHaveBeenCalledTimes(1));
    expect(mocks.editAccount.mock.calls[0][0]).toMatchObject({
      account: 'newuser',
      name: '新用户',
      roles: [{ id: 'role-b' }],
      locked: '0000',
      password: MD5.hash('abc12345').toString(),
    });
    expect(mocks.editAccount.mock.calls[0][0]).not.toHaveProperty('file');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  },
);

it('编辑回填角色，清空角色提交空数组，保存资料保持锁定且不回填旧密码', async () => {
  show({ operateType: 'edit', currentItem: account });
  expect(
    screen.getByRole('checkbox', { name: '授权角色管理员' }),
  ).toBeChecked();
  expect(screen.getByLabelText(/^密码/)).toHaveValue('');
  fireEvent.click(screen.getByRole('checkbox', { name: '授权角色管理员' }));
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  await waitFor(() => expect(mocks.editAccount).toHaveBeenCalledTimes(1));
  expect(mocks.editAccount.mock.calls[0][0]).toMatchObject({
    id: 'user-a',
    roles: [],
    locked: '0001',
  });
  expect(mocks.editAccount.mock.calls[0][0].password).toBeUndefined();
  expect(account.roles).toEqual([{ id: 'role-a' }]);
});

it('少量角色保留与资料共用的伸展区域，去除授权标题且不制造空行', () => {
  show({ operateType: 'edit', currentItem: account, roles: [roles[0]] });
  const region = screen.getByRole('region', { name: '用户角色' });
  expect(screen.getAllByRole('row')).toHaveLength(2);
  expect(screen.queryByRole('heading', { name: '角色授权' })).toBeNull();
  expect(window.getComputedStyle(region).position).toBe('relative');
  expect(window.getComputedStyle(region).minHeight).toBe('320px');
  const layout = region.parentElement;
  const wrapper = region.querySelector('.ant-table-wrapper');
  if (!layout || !wrapper) throw new Error('未找到左右布局或角色列表容器');
  expect(window.getComputedStyle(layout).alignItems).toBe('stretch');
  expect(window.getComputedStyle(wrapper).position).toBe('absolute');
  expect(window.getComputedStyle(wrapper).overflow).toBe('auto');
});

it('请求失败保留输入与角色，密码不一致阻止提交', async () => {
  mocks.editAccount.mockResolvedValue({
    success: false,
    message: '保存未成功',
  });
  show({
    operateType: 'edit',
    currentItem: { ...account, frozen: 0, locked: '0000' },
  });
  change(/^密码/, 'abc12345');
  change('确认密码', 'abc12346');
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  expect(await screen.findByText('两次输入的密码不一致')).toBeInTheDocument();
  expect(mocks.editAccount).not.toHaveBeenCalled();
  change('确认密码', 'abc12345');
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  await waitFor(() => expect(mocks.editAccount).toHaveBeenCalledTimes(1));
  expect(
    screen.getByRole('checkbox', { name: '授权角色管理员' }),
  ).toBeChecked();
  expect(screen.getByLabelText(/^密码/)).toHaveValue('abc12345');
});

it('角色加载/失败时禁用保存，失败提供重试；系统账号不能保存', () => {
  const retry = vi.fn();
  const view = show({ rolesError: true, onRetryRoles: retry });
  expect(screen.getByRole('button', { name: /保\s*存/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /重\s*试/ }));
  expect(retry).toHaveBeenCalledTimes(1);
  view.unmount();
  const loading = show({ rolesLoading: true });
  expect(screen.getByRole('button', { name: /保\s*存/ })).toBeDisabled();
  loading.unmount();
  show({
    operateType: 'edit',
    currentItem: { ...account, frozen: 9999, locked: '9999' },
  });
  expect(screen.getByRole('button', { name: /保\s*存/ })).toBeDisabled();
  expect(
    screen.getByRole('checkbox', { name: '授权角色业务主管' }),
  ).toBeDisabled();
});

it('保存期间防重复提交并阻止关闭，成功后才关闭', async () => {
  let finish: (result: { success: boolean }) => void = () => {};
  mocks.editAccount.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const onClose = vi.fn();
  show({ operateType: 'edit', currentItem: account, onClose });
  const save = screen.getByRole('button', { name: /保\s*存/ });
  fireEvent.click(save);
  fireEvent.click(save);
  await waitFor(() => expect(mocks.editAccount).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button', { name: /取\s*消/ })).toBeDisabled();
  expect(onClose).not.toHaveBeenCalled();
  finish({ success: true });
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});

it('角色修改未保存时取消须确认放弃', async () => {
  const onClose = vi.fn();
  show({ onClose });
  fireEvent.click(screen.getByRole('checkbox', { name: '授权角色管理员' }));
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  expect(
    await screen.findByText('放弃未保存的修改？', {
      selector: '.ant-modal-confirm-title',
    }),
  ).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '放弃修改' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});

it.each(['switch', 'unmount', 'switch-back'] as const)(
  '真实保存处理器在延迟校验期间%s，旧校验成功也不发送写请求',
  async (scenario) => {
    const instance = renderHook(() => Form.useForm<unknown>());
    const form = instance.result.current[0];
    const useForm = vi.spyOn(Form, 'useForm').mockReturnValue([form]);
    const oldValues = { ...account, password: undefined, roles: account.roles };
    let finish: (values: AccountItem) => void = () => {};
    const pending = new Promise<AccountItem>((resolve) => {
      finish = resolve;
    });
    const validate = vi.spyOn(form, 'validateFields').mockReturnValue(pending);
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const renderForm = (item: AccountItem) => (
      <App>
        <AOEForm
          operateType="edit"
          currentItem={item}
          orgs={[{ id: 'dept-a', title: '测试部门' }]}
          roles={roles}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </App>
    );
    const view = render(renderForm(account));
    try {
      fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
      expect(validate).toHaveBeenCalledTimes(1);
      if (scenario === 'unmount') {
        view.unmount();
      } else {
        view.rerender(
          renderForm({
            ...account,
            id: 'user-b',
            account: 'newuser',
            name: '新用户',
          }),
        );
        if (scenario === 'switch-back') view.rerender(renderForm(account));
      }
      await act(async () => {
        finish(oldValues);
        await pending;
      });
      expect(mocks.editAccount).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      if (scenario !== 'unmount') {
        expect(screen.getByLabelText('姓名')).toHaveValue(
          scenario === 'switch' ? '新用户' : '测试用户',
        );
        expect(
          screen.getByRole('button', { name: /取\s*消/ }),
        ).not.toBeDisabled();
      }
    } finally {
      view.unmount();
      validate.mockRestore();
      useForm.mockRestore();
      instance.unmount();
    }
  },
);

it('旧校验完成不清除新会话正在保存的状态，新会话只提交自己的用户', async () => {
  const instance = renderHook(() => Form.useForm<unknown>());
  const form = instance.result.current[0];
  const useForm = vi.spyOn(Form, 'useForm').mockReturnValue([form]);
  let finishOld: (values: AccountItem) => void = () => {};
  let finishNew: (values: AccountItem) => void = () => {};
  const oldValidation = new Promise<AccountItem>((resolve) => {
    finishOld = resolve;
  });
  const newValidation = new Promise<AccountItem>((resolve) => {
    finishNew = resolve;
  });
  const validate = vi
    .spyOn(form, 'validateFields')
    .mockReturnValueOnce(oldValidation)
    .mockReturnValueOnce(newValidation);
  const renderForm = (item: AccountItem) => (
    <App>
      <AOEForm
        operateType="edit"
        currentItem={item}
        orgs={[{ id: 'dept-a', title: '测试部门' }]}
        roles={roles}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    </App>
  );
  const view = render(renderForm(account));
  const next = {
    ...account,
    id: 'user-b',
    account: 'newuser',
    name: '新用户',
    password: undefined,
  };
  try {
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
    view.rerender(renderForm(next));
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
    expect(validate).toHaveBeenCalledTimes(2);
    await act(async () => {
      finishOld({ ...account, password: undefined });
      await oldValidation;
    });
    expect(mocks.editAccount).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /取\s*消/ })).toBeDisabled();
    await act(async () => {
      finishNew(next);
      await newValidation;
    });
    expect(mocks.editAccount).toHaveBeenCalledTimes(1);
    expect(mocks.editAccount.mock.calls[0][0]).toMatchObject({
      id: 'user-b',
      account: 'newuser',
      name: '新用户',
    });
  } finally {
    view.unmount();
    validate.mockRestore();
    useForm.mockRestore();
    instance.unmount();
  }
});
