import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { history } from '@umijs/max';
import { App, type UploadProps } from 'antd';
import { beforeEach, expect, it, vi } from 'vitest';
import AOEForm from './aoeform';

type RequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0];
const mocks = vi.hoisted(() => ({
  requests: [] as RequestOptions[],
  abort: vi.fn(),
  editAccount: vi.fn(),
  change: undefined as UploadProps['onChange'],
}));
vi.mock('@umijs/max', async () => {
  const { createHistory } = await import('@@/core/history');
  return {
    history: createHistory({
      type: 'memory',
      initialEntries: ['/sys/account'],
    }),
  };
});
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Upload: (props: UploadProps) => {
      mocks.change = props.onChange;
      return (
        <actual.Upload
          {...props}
          customRequest={(options) => {
            mocks.requests.push(options);
            return { abort: mocks.abort };
          }}
        />
      );
    },
  };
});
vi.mock('./service', () => ({
  editAccount: mocks.editAccount,
  checkAccountUnique: vi.fn(),
}));
vi.mock('@/components', () => ({ TreeSelector: () => null }));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.requests = [];
  history.replace('/sys/account');
});
const show = () => {
  const close = vi.fn();
  const view = render(
    <App>
      <AOEForm
        operateType="create"
        currentItem={null}
        orgs={[]}
        roles={[]}
        onClose={close}
        onSuccess={vi.fn()}
      />
    </App>,
  );
  return { ...view, close };
};
const upload = async () => {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('未找到上传文件输入');
  fireEvent.change(input, {
    target: {
      files: [new File(['avatar'], 'avatar.png', { type: 'image/png' })],
    },
  });
  await waitFor(() => expect(mocks.requests).toHaveLength(1));
};

it('实际Upload开始后关闭/取消/ESC/路由均被保护，上传结束才恢复关闭确认', async () => {
  const view = show();
  await upload();
  expect(screen.getByRole('button', { name: /取\s*消/ })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  const section = document.querySelector('.ant-modal-wrap');
  if (!section) throw new Error('未找到用户弹窗');
  fireEvent.keyDown(section, { key: 'Escape', keyCode: 27 });
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  act(() => history.push('/sys/role'));
  expect(history.location.pathname).toBe('/sys/account');
  expect(view.close).not.toHaveBeenCalled();
  act(() =>
    mocks.requests[0].onSuccess?.({
      success: true,
      data: { pname: 'avatar.png' },
    }),
  );
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /取\s*消/ })).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  fireEvent.click(await screen.findByRole('button', { name: '放弃修改' }));
  expect(view.close).toHaveBeenCalledTimes(1);
});

it('已弹出放弃确认后启动上传，再确认不能关闭；卸载后的上传回调无效', async () => {
  const view = show();
  fireEvent.change(screen.getByLabelText('姓名'), {
    target: { value: '已修改' },
  });
  fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
  await screen.findByRole('button', { name: '放弃修改' });
  await upload();
  fireEvent.click(screen.getByRole('button', { name: '放弃修改' }));
  expect(view.close).not.toHaveBeenCalled();
  const lateChange = mocks.change;
  view.unmount();
  expect(mocks.abort).toHaveBeenCalled();
  act(() =>
    lateChange?.({
      file: { uid: 'stale', name: 'avatar.png', status: 'done' },
      fileList: [],
    }),
  );
  expect(view.close).not.toHaveBeenCalled();
  expect(mocks.editAccount).not.toHaveBeenCalled();
});
