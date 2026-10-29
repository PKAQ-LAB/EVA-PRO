import { readFileSync } from 'node:fs';
import ProCard from '@ant-design/pro-components/es/card';
import ToolbarRender from '@ant-design/pro-components/es/table/components/ToolBar';
import { TableProvider } from '@ant-design/pro-components/es/table/Store/Provide';
import { genCopyable } from '@ant-design/pro-components/es/utils/genCopyable';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type RecordItem = { frozen: number; code?: string; status?: string };
type TableProps = {
  params?: Record<string, unknown>;
  headerTitle?: ReactNode;
  defaultSize?: string;
  size?: string;
  columns: { title: string; align?: string }[];
  rowClassName: (record: RecordItem) => string;
  rowSelection: {
    getCheckboxProps: (record: RecordItem) => { disabled: boolean };
  };
};
const mocks = vi.hoisted(() => ({
  tables: [] as TableProps[],
  listRoleModules: vi.fn(),
}));
const captureTable = (props: TableProps) => {
  mocks.tables.push(props);
  return null;
};

vi.mock('@ant-design/pro-components', () => ({
  PageContainer: ({ children }: { children: ReactNode }) => children,
  ProTable: (props: TableProps) => captureTable(props),
}));
vi.mock('antd', async (importOriginal) => ({
  ...(await importOriginal<typeof import('antd')>()),
  App: { useApp: () => ({ message: {}, modal: {} }) },
  Table: (props: TableProps) => captureTable(props),
}));
vi.mock('@umijs/max', () => ({
  useAccess: () => ({ canRequest: () => true }),
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
  useModel: () => ({ initialState: {} }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [], isLoading: false, refetch: vi.fn() }),
}));
vi.mock('@/appicon', () => ({ default: {} }));
vi.mock('@/components', () => ({
  SideLayout: ({
    body,
    children,
  }: {
    body: ReactNode;
    children: ReactNode;
  }) => (
    <>
      {body}
      {children}
    </>
  ),
}));
vi.mock('./account/aoeform', () => ({ default: () => null }));
vi.mock('./account/rolemodal', () => ({ default: () => null }));
vi.mock('./account/service', () => ({}));
vi.mock('./role/service', () => ({ listRoleModules: mocks.listRoleModules }));
vi.mock('./module/service', () => ({}));
vi.mock('./organization/service', () => ({}));
vi.mock('./role/aoeform', () => ({
  default: ({ modalType }: { modalType: string }) => (
    <div data-testid="role-form" data-mode={modalType} />
  ),
}));
vi.mock('./role/component/roleconfig', () => ({ default: () => null }));
vi.mock('./role/component/rolemodule', () => ({ default: () => null }));
vi.mock('./role/component/roleuser', () => ({ default: () => null }));
vi.mock('./module/aoeform', () => ({ default: () => null }));
vi.mock('./organization/aoeform', () => ({ default: () => null }));
vi.mock('./module/lineaoeform', () => ({ default: () => null }));
vi.mock('./dictionary/lineaoeform', () => ({ default: () => null }));
vi.mock('../log/biz/service', () => ({}));
vi.mock('../log/error/service', () => ({}));

describe('系统列表只读行分类', () => {
  beforeEach(() => {
    mocks.tables.length = 0;
  });

  it.each(['role', 'account', 'biz', 'error'] as const)(
    '%s真实共用搜索区末尾去额外外距且重置仍清空查询',
    async (page) => {
      const load = {
        role: () => import('./role/index'),
        account: () => import('./account/index'),
        biz: () => import('../log/biz'),
        error: () => import('../log/error'),
      };
      const { default: Page } = await load[page]();
      const view = render(<Page />);
      const form = view.container.querySelector('form.eva-table-search');
      expect(form).not.toBeNull();
      const css = readFileSync('src/global.css', 'utf8');
      const style = document.createElement('style');
      style.textContent =
        css
          .match(
            /[^{}]*(?:eva-table-search|eva-body \.ant-pro-table \.ant-pro-card-body)[^{}]*\{[^}]*\}/g,
          )
          ?.join('\n') || '';
      document.head.append(style);
      const reset = screen.getByRole('button', { name: /重\s*置/ });
      const actions = reset.closest('.ant-form-item');
      if (!form || !actions) throw new Error('搜索结构缺失');
      expect(
        Number.parseFloat(window.getComputedStyle(form).paddingInlineEnd),
      ).toBe(0);
      const card = render(
        <div className="eva-body">
          <div className="ant-pro-table">
            <ProCard>
              <div>表格内容</div>
            </ProCard>
          </div>
        </div>,
      );
      const cardBody = card.container.querySelector('.ant-pro-card-body');
      if (!cardBody) throw new Error('实际卡片主体缺失');
      expect(
        Number.parseFloat(window.getComputedStyle(cardBody).paddingInline),
      ).toBe(Number.parseFloat(window.getComputedStyle(form).paddingInlineEnd));
      expect(
        Number.parseFloat(window.getComputedStyle(actions).marginInlineEnd),
      ).toBe(0);
      if (page === 'role' || page === 'account') {
        fireEvent.change(
          screen.getByLabelText(page === 'role' ? '角色名称' : '账号'),
          { target: { value: 'search-term' } },
        );
        fireEvent.submit(form);
        await waitFor(() =>
          expect(mocks.tables.at(-1)?.params).toMatchObject(
            page === 'role'
              ? { name: 'search-term' }
              : { account: 'search-term' },
          ),
        );
      } else
        expect(Object.keys(mocks.tables.at(-1)?.params || {})).not.toHaveLength(
          0,
        );
      fireEvent.click(reset);
      await waitFor(() => expect(mocks.tables.at(-1)?.params).toEqual({}));
      view.unmount();
      card.unmount();
      style.remove();
    },
  );

  it('新增角色挂载原生工具栏左侧，右侧保留刷新/密度/列设置，点击打开原新增表单', async () => {
    const { default: Page } = await import('./role/index');
    const page = render(<Page />);
    const table = mocks.tables.at(-1);
    if (!table) throw new Error('角色页没有表格');
    expect(
      page.container.querySelector('.eva-ribbon')?.textContent,
    ).not.toContain('新增角色');
    const toolbar = render(
      <TableProvider initValue={{ defaultSize: 'small', columns: [] }}>
        <ToolbarRender
          hideToolbar={false}
          onFormSearchSubmit={vi.fn()}
          searchNode={null}
          tableColumn={[]}
          selectedRows={[]}
          selectedRowKeys={[]}
          headerTitle={table.headerTitle}
          toolbar={undefined}
          options={undefined}
          actionRef={{ current: undefined }}
        />
      </TableProvider>,
    );
    const add = screen.getByRole('button', { name: /新增角色/ });
    expect(
      toolbar.container
        .querySelector('.ant-pro-table-list-toolbar-left')
        ?.contains(add),
    ).toBe(true);
    const right = toolbar.container.querySelector(
      '.ant-pro-table-list-toolbar-right',
    );
    for (const icon of ['reload', 'column-height', 'setting'])
      expect(right?.querySelector(`[data-icon="${icon}"]`)).not.toBeNull();
    fireEvent.click(add);
    expect(screen.getByTestId('role-form')).toHaveAttribute(
      'data-mode',
      'create',
    );
    toolbar.unmount();
    page.unmount();
  });

  it.each(['account', 'role', 'module', 'organization'] as const)(
    '%s 保留锁定分类及只读选择限制',
    async (page) => {
      if (page === 'account') {
        const { default: Page } = await import('./account/list');
        render(
          <Page
            selectedRowKeys={[]}
            setSelectedRowKeys={vi.fn()}
            onEdit={vi.fn()}
            onView={vi.fn()}
            onGrant={vi.fn()}
          />,
        );
      } else {
        const loadPage = {
          role: () => import('./role/index'),
          module: () => import('./module/index'),
          organization: () => import('./organization/index'),
        };
        const { default: Page } = await loadPage[page]();
        render(<Page />);
      }
      const table = mocks.tables.at(-1);
      if (!table) throw new Error('页面没有渲染表格');
      expect(
        table.columns.find((column) => column.title === '操作')?.align,
      ).toBe('center');
      expect(table.defaultSize || table.size).toBe('small');
      if (page === 'account' || page === 'role')
        expect(table.size).toBeUndefined();
      expect(table.rowClassName({ frozen: 0 })).toBe('');
      expect(table.rowClassName({ frozen: 1 })).toBe('eva-locked');
      expect(table.rowClassName({ frozen: 9999 })).toBe('eva-readonly');
      expect(
        table.rowSelection.getCheckboxProps({ frozen: 9999 }).disabled,
      ).toBe(true);
      expect(table.rowSelection.getCheckboxProps({ frozen: 1 }).disabled).toBe(
        page === 'account',
      );
      if (page === 'role') {
        for (const sentinel of [{ code: '9999' }, { status: '9999' }]) {
          const record = { frozen: 1, ...sentinel };
          expect(table.rowClassName(record)).toBe('eva-readonly');
          expect(table.rowSelection.getCheckboxProps(record).disabled).toBe(
            true,
          );
        }
      }
    },
  );

  it('实际省略号描述的Typography使用只读灰色，普通描述及链接保持原色', () => {
    const css = readFileSync('src/global.css', 'utf8');
    const readonlyRules =
      css.match(/[^{}]*eva-readonly[^{}]*\{[^}]*\}/g)?.join('\n') || '';
    const style = document.createElement('style');
    style.textContent = `.ant-typography { color: rgb(17, 17, 17); }\n${readonlyRules}`;
    document.head.append(style);
    const view = render(
      <table>
        <tbody className="ant-table-tbody">
          <tr className="eva-readonly">
            <td>
              {genCopyable('只读描述', { ellipsis: true }, '只读描述')}
              <a className="ant-typography" href="#detail">
                查看链接
              </a>
            </td>
          </tr>
          <tr>
            <td>{genCopyable('普通描述', { ellipsis: true }, '普通描述')}</td>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText('只读描述')).toHaveClass('ant-typography');
    expect(window.getComputedStyle(screen.getByText('只读描述')).color).toBe(
      'rgba(0, 0, 0, 0.25)',
    );
    expect(window.getComputedStyle(screen.getByText('普通描述')).color).toBe(
      'rgb(17, 17, 17)',
    );
    expect(window.getComputedStyle(screen.getByText('查看链接')).color).toBe(
      'rgb(17, 17, 17)',
    );
    expect(readonlyRules).not.toMatch(/background|opacity/);
    expect(readonlyRules).toContain('--ant-color-text-disabled');
    view.unmount();
    style.remove();
  });

  it.each([
    [
      '字典',
      async () => {
        const { default: Page } = await import('./dictionary/list');
        return (
          <Page
            data={[]}
            loading={false}
            onCreate={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        );
      },
    ],
    [
      '字典明细',
      async () => {
        const { default: Page } = await import('./dictionary/linelist');
        return (
          <Page
            lines={[]}
            setLines={vi.fn()}
            operateType="edit"
            isCurrent={() => true}
          />
        );
      },
    ],
    [
      '模块资源',
      async () => {
        const { default: Page } = await import('./module/linelist');
        return <Page lines={[]} setLines={vi.fn()} />;
      },
    ],
    [
      '业务日志',
      async () => {
        const { default: Page } = await import('../log/biz');
        return <Page />;
      },
    ],
    [
      '错误日志',
      async () => {
        const { default: Page } = await import('../log/error');
        return <Page />;
      },
    ],
  ] as const)('%s实际操作列居中', async (_name, load) => {
    render(await load());
    const table = mocks.tables.at(-1);
    expect(table?.defaultSize || table?.size).toBe('small');
    if (['业务日志', '错误日志'].includes(_name))
      expect(table?.size).toBeUndefined();
    expect(
      mocks.tables.at(-1)?.columns.find((column) => column.title === '操作')
        ?.align,
    ).toBe('center');
  });

  it.each(['roleuser', 'rolemodule', 'online'] as const)(
    '%s实际表格默认紧密',
    async (page) => {
      if (page === 'online') {
        const { default: Page } = await import('../log/online');
        render(<Page />);
      } else if (page === 'roleuser') {
        const { default: Page } = await vi.importActual<
          typeof import('./role/component/roleuser')
        >('./role/component/roleuser');
        render(
          <Page open roleId={null} onClose={vi.fn()} onSuccess={vi.fn()} />,
        );
      } else {
        mocks.listRoleModules.mockResolvedValue({
          data: { modules: [{ id: 'module', name: '模块' }], checked: [] },
        });
        const { default: Page } = await vi.importActual<
          typeof import('./role/component/rolemodule')
        >('./role/component/rolemodule');
        render(
          <Page open roleId="role" onClose={vi.fn()} onSuccess={vi.fn()} />,
        );
        await waitFor(() => expect(mocks.tables.length).toBeGreaterThan(0));
      }
      const table = mocks.tables.at(-1);
      expect(table?.defaultSize || table?.size).toBe('small');
      if (page === 'online') expect(table?.size).toBeUndefined();
    },
  );
});
