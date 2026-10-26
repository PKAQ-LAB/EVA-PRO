import { fireEvent, render, screen, within } from '@testing-library/react';
import { Button, ConfigProvider, Table, Tag, theme } from 'antd';
import { expect, it, vi } from 'vitest';
import { viewRow } from '../RecordView';
import { ActionGroup, actionColumn, TextCell, textColumn } from './index';

const longText =
  '中文字段 Full English text WITHOUT_SPACES_ABCDEFGHIJKLMN '.repeat(8);
const labels = ['查看', '锁定', '角色授权', '编辑', '删除'];
it.each(
  [false, true].flatMap((dark) => [0, 1, 5].map((count) => ({ dark, count }))),
)(
  '真实窄容器操作center/nowrap/无ellipsis且不隐藏动作（暗色=$dark，数量=$count）',
  ({ dark, count }) => {
    const view = vi.fn();
    render(
      <ConfigProvider
        theme={{
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <div style={{ width: 320 }}>
          <Table
            rowKey="id"
            pagination={false}
            scroll={{ x: 900 }}
            dataSource={[{ id: 'a', name: longText }]}
            onRow={() => viewRow(view)}
            columns={[
              textColumn<{ id: string; name: string }>('名称', 'name', 500),
              {
                title: '操作',
                ...actionColumn(400),
                render: () => (
                  <ActionGroup>
                    {labels.slice(0, count).map((label) => (
                      <Button key={label} type="link">
                        {label}
                      </Button>
                    ))}
                  </ActionGroup>
                ),
              },
            ]}
          />
        </div>
      </ConfigProvider>,
    );
    const row = screen.getByRole('row', {
      name: new RegExp(longText.slice(0, 10)),
    });
    const action = within(row).getAllByRole('cell').at(-1);
    if (!action) throw new Error('没有操作单元格');
    expect(action).toHaveStyle({
      textAlign: 'center',
      whiteSpace: 'nowrap',
      overflow: 'visible',
      textOverflow: 'clip',
    });
    expect(action).not.toHaveClass('ant-table-cell-ellipsis');
    const header = screen.getByRole('columnheader', { name: '操作' });
    expect(header).toHaveStyle({
      textAlign: 'center',
      whiteSpace: 'nowrap',
      overflow: 'visible',
    });
    expect(within(action).queryAllByRole('button')).toHaveLength(count);
    const group = action.querySelector('[data-no-row-view]');
    expect(group).toHaveStyle({
      display: 'inline-flex',
      flexWrap: 'nowrap',
      whiteSpace: 'nowrap',
      overflow: 'visible',
      justifyContent: 'center',
    });
    for (const label of labels.slice(0, count)) {
      const button = within(action).getByRole('button', {
        name: new RegExp(label.split('').join('\\s*')),
      });
      expect(button).toBeVisible();
      fireEvent.doubleClick(button);
    }
    expect(view).not.toHaveBeenCalled();
    expect(screen.getByRole('table')).toHaveStyle({ width: '900px' });
    expect(screen.getByRole('table').parentElement).toHaveStyle({
      overflowX: 'auto',
    });
  },
);

it.each([false, true])(
  '受限文本/自定义标签悬停全文，浮层双击不查看（暗色=%s）',
  async (dark) => {
    const view = vi.fn();
    render(
      <ConfigProvider
        theme={{
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: { motion: false },
        }}
      >
        <Table
          rowKey="id"
          pagination={false}
          scroll={{ x: 400 }}
          dataSource={[{ id: 'a', text: longText }]}
          onRow={() => viewRow(view)}
          columns={[
            {
              title: '字典值',
              width: 200,
              ellipsis: { showTitle: false },
              render: () => (
                <TextCell text={longText}>
                  <Tag>{longText}</Tag>
                </TextCell>
              ),
            },
            {
              ...textColumn<{ id: string; text: string }>(
                '普通文本',
                'text',
                200,
              ),
            },
          ]}
        />
      </ConfigProvider>,
    );
    const triggers = screen.getAllByText(longText.trim());
    const trigger = triggers[0].parentElement;
    if (!trigger) throw new Error('没有自定义文本容器');
    expect(trigger).toHaveStyle({
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
    });
    fireEvent.mouseEnter(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(longText.trim());
    fireEvent.doubleClick(tooltip);
    expect(view).not.toHaveBeenCalled();
    fireEvent.doubleClick(triggers[1]);
    expect(view).toHaveBeenCalledTimes(1);
  },
);

it('空值无伪造全文、数字0保留，不把对象/秘密字段自动展开', () => {
  const { container } = render(
    <>
      <TextCell text={null} />
      <TextCell text="" />
      <TextCell text={0} />
      <TextCell text={{ token: 'SECRET_SENTINEL' }} />
    </>,
  );
  expect(screen.getAllByText('—')).toHaveLength(3);
  expect(screen.getByText('0')).toBeInTheDocument();
  expect(container).not.toHaveTextContent('SECRET_SENTINEL');
  expect(container.querySelector('[title]')).toBeNull();
});

it('无空格长字符串通过真实悬停显示全部内容', async () => {
  const unbroken = 'AbC0123456789'.repeat(64);
  render(
    <div style={{ width: 160 }}>
      <TextCell text={unbroken} />
    </div>,
  );
  const trigger = screen.getByText(unbroken);
  fireEvent.mouseEnter(trigger);
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toHaveTextContent(unbroken);
  expect(tooltip).toHaveStyle({
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
  });
});

it('自定义链接全文提示保留原点击，双击链接不打开行查看', async () => {
  const view = vi.fn();
  const click = vi.fn();
  render(
    <Table
      rowKey="id"
      pagination={false}
      onRow={() => viewRow(view)}
      dataSource={[{ id: 'a' }]}
      columns={[
        {
          title: '链接',
          width: 200,
          ellipsis: { showTitle: false },
          render: () => (
            <TextCell text={longText}>
              <a href="#record" onClick={click}>
                {longText}
              </a>
            </TextCell>
          ),
        },
      ]}
    />,
  );
  const link = screen.getByRole('link');
  const trigger = link.parentElement;
  if (!trigger) throw new Error('没有链接文本容器');
  fireEvent.mouseEnter(trigger);
  expect(await screen.findByRole('tooltip')).toHaveTextContent(longText.trim());
  fireEvent.click(link);
  fireEvent.doubleClick(link);
  expect(click).toHaveBeenCalledTimes(1);
  expect(view).not.toHaveBeenCalled();
});
