import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { beforeEach, expect, it, vi } from 'vitest';
import APIS from '@/apis';
import OrgAOEForm from './aoeform';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@umijs/max', () => ({
  request: mocks.request,
  history: { block: () => vi.fn() },
}));
const saved = () =>
  mocks.request.mock.calls.filter(([url]) => url === APIS.ORG_EDIT);
function show() {
  const onSuccess = vi.fn();
  render(
    <ConfigProvider locale={zhCN} theme={{ token: { motion: false } }}>
      <App>
        <OrgAOEForm
          canRequest={() => true}
          operateType="create"
          currentItem={{}}
          data={[]}
          onClose={vi.fn()}
          onSuccess={onSuccess}
        />
      </App>
    </ConfigProvider>,
  );
  fireEvent.change(screen.getByLabelText('部门名称'), {
    target: { value: 'QA_P_20261023' },
  });
  fireEvent.change(screen.getByLabelText('部门编码'), {
    target: { value: 'QA_P_20261023' },
  });
  return onSuccess;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.request.mockResolvedValue({ success: true });
});

it('合法顶级候选通过真实Form/service/http原样校验并保存', async () => {
  const onSuccess = show();
  fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
  await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  expect(mocks.request).toHaveBeenCalledWith(APIS.ORG_CHECKUNIQUE, {
    method: 'POST',
    data: { id: undefined, pid: undefined, code: 'QA_P_20261023' },
  });
  expect(saved()[0][1].data).toMatchObject({
    code: 'QA_P_20261023',
    name: 'QA_P_20261023',
    pid: undefined,
    frozen: 0,
  });
});

it.each([
  {
    error: Object.assign(new Error('组织(部门)编码已经存在'), {
      name: 'BizError',
    }),
    text: '组织(部门)编码已经存在',
  },
  { response: undefined, text: '编码校验未通过，请稍后重试' },
  {
    error: Object.assign(new Error('Unauthorized'), {
      response: { status: 401 },
    }),
    text: '登录已失效，请重新登录后校验',
  },
  {
    response: { success: false, message: '部门编码已存在' },
    text: '部门编码已存在',
  },
  {
    error: Object.assign(new Error('当前用户不允许校验部门编码'), {
      name: 'BizError',
    }),
    text: '当前用户不允许校验部门编码',
  },
  {
    error: Object.assign(new Error('Forbidden'), { response: { status: 403 } }),
    text: '无权限校验部门编码',
  },
  {
    error: new Error('Network Error'),
    text: '编码校验失败，请检查网络或稍后重试',
  },
  {
    error: Object.assign(new Error('Server Error'), {
      response: { status: 500 },
    }),
    text: '编码校验服务异常，请稍后重试',
  },
])(
  '远程拒绝显示其语义，不能变成格式错误：$text',
  async ({ response, error, text }) => {
    if (error) mocks.request.mockRejectedValue(error);
    else mocks.request.mockResolvedValue(response);
    show();
    fireEvent.blur(screen.getByLabelText('部门编码'));
    expect(await screen.findByText(text)).toBeInTheDocument();
    expect(screen.queryByText(/编码格式错误/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /确\s*定/ })).not.toHaveClass(
        'ant-btn-loading',
      ),
    );
    expect(saved()).toHaveLength(0);
    expect(screen.getByLabelText('部门编码')).toHaveValue('QA_P_20261023');
  },
);

it('真实非法编码先本地拒绝，不发唯一校验或保存请求', async () => {
  show();
  fireEvent.change(screen.getByLabelText('部门编码'), {
    target: { value: 'bad-code!' },
  });
  fireEvent.blur(screen.getByLabelText('部门编码'));
  expect(await screen.findByText(/编码格式错误/)).toBeInTheDocument();
  expect(mocks.request).not.toHaveBeenCalled();
});
