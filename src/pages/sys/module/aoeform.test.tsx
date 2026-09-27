import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ModuleAOEForm from './aoeform';

const mocks = vi.hoisted(() => ({
  checkModuleUnique: vi.fn(),
  editModule: vi.fn(),
}));

vi.mock('@/components', () => ({
  IconSelect: ({ id, value, onChange }: ComponentProps<'input'>) => (
    <input id={id} value={value} onChange={onChange} />
  ),
  TreeSelector: ({ id, value, onChange }: ComponentProps<'input'>) => (
    <input id={id} value={value} onChange={onChange} />
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
            orders: '1',
            status: '0000',
          }}
          data={[]}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </App>,
    );

    expect(await screen.findByLabelText('模块编码')).toHaveValue('MODULE_CODE');
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
