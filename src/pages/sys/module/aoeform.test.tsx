import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ModuleAOEForm from './aoeform';

const mocks = vi.hoisted(() => ({
  checkModuleUnique: vi.fn(),
  editModule: vi.fn(),
}));

vi.mock('@umijs/max', () => ({ history: { block: () => vi.fn() } }));

vi.mock('@/components', () => ({
  IconSelect: ({ id, value, onChange }: ComponentProps<'input'>) => (
    <input id={id} value={value} onChange={onChange} />
  ),
  TreeSelector: ({
    id,
    value,
    onChange,
    disabled,
  }: ComponentProps<'input'>) => (
    <input id={id} value={value} onChange={onChange} disabled={disabled} />
  ),
}));

vi.mock('./linelist', () => ({
  default: () => null,
}));

vi.mock('./service', () => ({
  checkModuleUnique: mocks.checkModuleUnique,
  editModule: mocks.editModule,
}));

describe('ModuleAOEForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkModuleUnique.mockResolvedValue({ success: true });
    mocks.editModule.mockResolvedValue({ success: true });
  });

  it('binds code and routeUrl fields without exposing or submitting path', async () => {
    render(
      <App>
        <ModuleAOEForm
          operateType="edit"
          currentItem={{
            id: 'module-id',
            name: '模块管理',
            code: 'MODULE_CODE',
            path: '/tree/module-id',
            routeUrl: '/system/module',
            icon: 'setting',
            orders: 1,
            status: '0000',
          }}
          data={[]}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </App>,
    );

    expect(await screen.findByLabelText('模块编码')).toHaveValue('MODULE_CODE');
    const nameColumn = screen
      .getByLabelText('模块名称')
      .closest('.ant-col-xs-24');
    const codeColumn = screen
      .getByLabelText('模块编码')
      .closest('.ant-col-xs-24');
    expect(nameColumn?.parentElement).toBe(codeColumn?.parentElement);
    expect(nameColumn).toHaveClass('ant-col-xs-24', 'ant-col-sm-12');
    expect(codeColumn).toHaveClass('ant-col-xs-24', 'ant-col-sm-12');
    const header = document.querySelector('.ant-drawer-header');
    const close = screen.getByRole('button', { name: 'Close' });
    expect(close).toHaveClass('ant-drawer-close-end');
    expect(header?.lastElementChild).toBe(close);
    expect(screen.getByLabelText('路由地址')).toHaveValue('/system/module');
    expect(screen.queryByLabelText('Path')).not.toBeInTheDocument();
    expect(
      screen.queryByDisplayValue('/tree/module-id'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /保\s*存/u }));

    await waitFor(() => expect(mocks.editModule).toHaveBeenCalledTimes(1));
    const submitted = mocks.editModule.mock.calls[0]?.[0];
    expect(submitted).toMatchObject({
      id: 'module-id',
      code: 'MODULE_CODE',
      routeUrl: '/system/module',
    });
    expect(submitted).not.toHaveProperty('path');
  });
});

it('新增下级路由地址预填父routeUrl且可编辑，保存不改父路径', async () => {
  vi.clearAllMocks();
  mocks.checkModuleUnique.mockResolvedValue({ success: true });
  mocks.editModule.mockResolvedValue({ success: true });
  const parent = {
    id: 'parent-a',
    name: '系统管理',
    path: '/0/parent-a',
    routeUrl: '/sys',
  };
  render(
    <App>
      <ModuleAOEForm
        operateType="create"
        currentItem={{
          parentId: 'parent-a',
          routeUrl: parent.routeUrl,
          name: '子模块',
          code: 'CHILD_CODE',
          icon: 'setting',
          orders: 1,
        }}
        data={[parent]}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    </App>,
  );
  expect(await screen.findByLabelText('路由地址')).toHaveValue('/sys');
  expect(screen.queryByLabelText('上级路由地址')).not.toBeInTheDocument();
  expect(screen.getByLabelText(/上级模块/)).toBeDisabled();
  expect(screen.getByLabelText('路由地址')).not.toHaveAttribute('readonly');
  fireEvent.change(screen.getByLabelText('路由地址'), {
    target: { value: '/sys/child' },
  });
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  await waitFor(() => expect(mocks.editModule).toHaveBeenCalledTimes(1));
  expect(mocks.editModule.mock.calls[0][0]).toMatchObject({
    parentId: 'parent-a',
    routeUrl: '/sys/child',
  });
  expect(mocks.editModule.mock.calls[0][0]).not.toHaveProperty('path');
  expect(parent).toEqual({
    id: 'parent-a',
    name: '系统管理',
    path: '/0/parent-a',
    routeUrl: '/sys',
  });
});

it.each([0, 1, 12.75])(
  '数字排序%s回填后仅改名称可直接保存，顺序保持数值',
  async (orders) => {
    vi.clearAllMocks();
    mocks.checkModuleUnique.mockResolvedValue({ success: true });
    mocks.editModule.mockResolvedValue({ success: true });
    render(
      <App>
        <ModuleAOEForm
          operateType="edit"
          currentItem={{
            id: 'child',
            name: '原名称',
            code: 'CHILD',
            routeUrl: '/sys/child',
            icon: 'setting',
            orders,
            status: '0000',
          }}
          data={[]}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </App>,
    );
    expect(
      await screen.findByRole('spinbutton', { name: '显示顺序' }),
    ).toHaveValue(String(orders));
    fireEvent.change(screen.getByLabelText('模块名称'), {
      target: { value: '仅改名称' },
    });
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
    await waitFor(() => expect(mocks.editModule).toHaveBeenCalledTimes(1));
    expect(mocks.editModule.mock.calls[0][0]).toMatchObject({
      name: '仅改名称',
      orders,
    });
    expect(screen.queryByText(/不是一个有效|undefined/)).toBeNull();
  },
);
