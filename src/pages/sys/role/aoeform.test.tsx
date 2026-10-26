import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { beforeEach, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import RoleAOEForm from './aoeform';
import type { RoleItem } from './data.d';
import { getRole } from './service';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  dict: {} as Record<string, string>,
}));
vi.mock('@umijs/max', () => ({
  history: { block: () => vi.fn() },
  request: mocks.request,
  useIntl: () => ({
    formatMessage: (
      { defaultMessage }: { defaultMessage: string },
      values?: Record<string, string>,
    ) => defaultMessage.replace('{action}', values?.action ?? ''),
  }),
}));
vi.mock('@/components', async () => ({
  DictSelector: (await import('@/components/DictSelector')).default,
}));
const saved = () =>
  mocks.request.mock.calls.filter(([url]) => url === APIS.ROLE_SAVE);
function show(
  currentItem: Partial<RoleItem> = {},
  modalType: 'create' | 'edit' = 'create',
) {
  return render(
    <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
      <App>
        <RoleAOEForm
          modalType={modalType}
          currentItem={currentItem}
          setModalType={vi.fn()}
          onSuccess={vi.fn()}
        />
      </App>
    </ConfigProvider>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.dict = {};
  mocks.request.mockImplementation(async (url: string) => {
    if (url === '/api/sys/dictionary/query/DATA_SCOPE')
      return { success: true, data: mocks.dict };
    return { success: true, data: [] };
  });
});

it('真实空字典无ALL初值，仅填名称编码无法保存且不触发POST', async () => {
  show();
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(
      '/api/sys/dictionary/query/DATA_SCOPE',
    ),
  );
  fireEvent.change(screen.getByLabelText('角色名称'), {
    target: { value: '新角色' },
  });
  fireEvent.change(screen.getByLabelText('角色编码'), {
    target: { value: 'ROLE_TEST' },
  });
  expect(screen.getByRole('combobox')).toHaveValue('');
  expect(screen.queryByText('0000')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  expect(await screen.findByText('请选择数据权限')).toBeInTheDocument();
  expect(saved()).toHaveLength(0);
  expect(screen.getByLabelText('角色名称')).toHaveValue('新角色');
});

it('新建必须由真实字典选项明确选择后才提交，允许用户实际选择已有ALL选项', async () => {
  mocks.dict = { '0000': '全部数据', '0001': '范围 0001' };
  show();
  fireEvent.change(screen.getByLabelText('角色名称'), {
    target: { value: '明确选择' },
  });
  fireEvent.change(screen.getByLabelText('角色编码'), {
    target: { value: 'ROLE_TEST' },
  });
  await waitFor(() =>
    expect(mocks.request).toHaveBeenCalledWith(
      '/api/sys/dictionary/query/DATA_SCOPE',
    ),
  );
  fireEvent.mouseDown(screen.getByRole('combobox'));
  const popup = document.querySelector<HTMLElement>(
    '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
  );
  if (!popup) throw new Error('数据权限选择器未打开');
  fireEvent.click(await within(popup).findByText('全部数据'));
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(saved()).toHaveLength(1));
  expect(saved()[0][1].data).toMatchObject({
    dataScope: '0000',
    name: '明确选择',
  });
});

it.each(['0000', '0001', '0003'])(
  '字典为空时编辑仅改名称仍保留实际scope%s及组织关联',
  async (dataScope) => {
    show(
      {
        id: 'role-a',
        name: '原名称',
        code: 'ROLE_TEST',
        dataScope,
        dataOrgIds: ['101', '102'],
      },
      'edit',
    );
    fireEvent.change(screen.getByLabelText('角色名称'), {
      target: { value: '仅改名称' },
    });
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    await waitFor(() => expect(saved()).toHaveLength(1));
    expect(saved()[0][1].data).toMatchObject({
      id: 'role-a',
      dataScope,
      name: '仅改名称',
    });
    expect(saved()[0][1].data.dataOrgIds).toBe('101,102');
  },
);

it('真实详情null不被legacy ALL复活为全部，缺值编辑被required阻断', async () => {
  const base = mocks.request.getMockImplementation();
  mocks.request.mockImplementation(async (url: string) =>
    url === `${APIS.ROLE_GET}/role-a`
      ? {
          success: true,
          data: {
            id: 'role-a',
            name: '未知范围',
            code: 'ROLE_TEST',
            dataScope: null,
            dataPermissionType: '0000',
          },
        }
      : base?.(url),
  );
  const detail = (await getRole('role-a')).data;
  show(detail, 'edit');
  expect(screen.getByRole('combobox')).toHaveValue('');
  expect(screen.queryByText('0000')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  expect(await screen.findByText('请选择数据权限')).toBeInTheDocument();
  expect(saved()).toHaveLength(0);
});

it('系统只读角色仍禁止编辑和保存', () => {
  show(
    {
      id: 'system-role',
      name: '系统角色',
      code: '9999',
      frozen: 9999,
      dataScope: '0000',
    },
    'edit',
  );
  expect(screen.getByLabelText('角色名称')).toBeDisabled();
  expect(screen.queryByRole('button', { name: /确\s*定/ })).toBeNull();
  expect(saved()).toHaveLength(0);
});

it.each([[], ''])(
  '编辑保留显式空组织关联%s，不用旧值或缺省覆盖',
  async (dataOrgIds) => {
    show(
      {
        id: 'role-a',
        name: '已有角色',
        code: 'ROLE_TEST',
        dataScope: '0001',
        dataOrgIds,
      },
      'edit',
    );
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    await waitFor(() => expect(saved()).toHaveLength(1));
    expect(saved()[0][1].data.dataOrgIds).toBe('');
  },
);

it('从已有ALL角色切换新增时清除旧范围，不能沿用上次ALL', async () => {
  const view = show(
    { id: 'role-a', name: '已有ALL', code: 'ROLE_TEST', dataScope: '0000' },
    'edit',
  );
  view.rerender(
    <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
      <App>
        <RoleAOEForm
          modalType="create"
          currentItem={{}}
          setModalType={vi.fn()}
          onSuccess={vi.fn()}
        />
      </App>
    </ConfigProvider>,
  );
  fireEvent.change(screen.getByLabelText('角色名称'), {
    target: { value: '新角色' },
  });
  fireEvent.change(screen.getByLabelText('角色编码'), {
    target: { value: 'ROLE_NEW' },
  });
  expect(screen.queryByText('0000')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  expect(await screen.findByText('请选择数据权限')).toBeInTheDocument();
  expect(saved()).toHaveLength(0);
});

it.each([
  {
    title: '主空串加legacy',
    fields: { dataOrgIds: '', dataPermissionDeptid: '101,102' },
    expected: '',
  },
  {
    title: '主空数组加legacy',
    fields: { dataOrgIds: [], dataPermissionDeptid: '101,102' },
    expected: '',
  },
  {
    title: '主字段缺失兼容legacy',
    fields: { dataPermissionDeptid: '101,102' },
    expected: '101,102',
  },
])(
  '$title经真实详情/表单/保存链保持清空或明确兼容语义',
  async ({ fields, expected }) => {
    const raw = {
      id: 'role-a',
      name: '原角色',
      code: 'ROLE_TEST',
      dataScope: '0001',
      ...fields,
    };
    const snapshot = structuredClone(raw);
    const base = mocks.request.getMockImplementation();
    mocks.request.mockImplementation(async (url: string) =>
      url === `${APIS.ROLE_GET}/role-a`
        ? { success: true, data: raw }
        : base?.(url),
    );
    const detail = (await getRole('role-a')).data;
    show(detail, 'edit');
    fireEvent.change(screen.getByLabelText('角色名称'), {
      target: { value: '仅改名称' },
    });
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    await waitFor(() => expect(saved()).toHaveLength(1));
    expect(saved()[0][1].data).toMatchObject({
      id: 'role-a',
      name: '仅改名称',
      dataScope: '0001',
      dataOrgIds: expected,
    });
    expect(raw).toEqual(snapshot);
  },
);
