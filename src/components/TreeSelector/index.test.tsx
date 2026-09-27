import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TreeSelector from './index';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
}));

vi.mock('@umijs/max', () => ({
  request: mocks.request,
}));

vi.mock('antd', () => ({
  TreeSelect: ({ treeData }: { treeData: unknown }) => (
    <div data-testid="tree-data">{JSON.stringify(treeData)}</div>
  ),
}));

describe('TreeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not mutate remote data and keeps one showAll node across reruns', async () => {
    const remoteNodes = [
      { title: '服务端全部', value: '0' },
      { title: '节点一', value: '1' },
      { title: '重复节点一', value: '1' },
    ];
    mocks.request.mockResolvedValue({ success: true, data: remoteNodes });

    const view = render(<TreeSelector url="/tree" showAll />);
    await waitFor(() => {
      expect(view.getByTestId('tree-data').textContent).toContain('节点一');
    });

    view.rerender(<TreeSelector url="/tree" showAll={false} />);
    await waitFor(() => {
      expect(mocks.request).toHaveBeenCalledTimes(2);
    });
    view.rerender(<TreeSelector url="/tree" showAll />);

    await waitFor(() => {
      expect(mocks.request).toHaveBeenCalledTimes(3);
      const treeData = JSON.parse(
        view.getByTestId('tree-data').textContent ?? '[]',
      ) as Array<{ title: string; value: string }>;
      expect(treeData.filter((node) => node.value === '0')).toHaveLength(1);
      expect(treeData.map((node) => node.value)).toEqual(['0', '1']);
      expect(treeData[0]?.title).toBe('全部');
    });
    expect(remoteNodes).toEqual([
      { title: '服务端全部', value: '0' },
      { title: '节点一', value: '1' },
      { title: '重复节点一', value: '1' },
    ]);
  });

  it('deduplicates static data globally after applying field keys', () => {
    const staticData = [
      {
        id: 'parent-1',
        label: '分支一',
        nodes: [{ id: 'shared', label: '首个共享节点' }],
      },
      {
        id: 'parent-2',
        label: '分支二',
        nodes: [
          { id: 'shared', label: '重复共享节点' },
          { id: 'unique', label: '唯一节点' },
        ],
      },
    ];

    const view = render(
      <TreeSelector
        data={staticData as never}
        keys={['id', 'label', 'nodes']}
        showAll={false}
      />,
    );
    const treeData = JSON.parse(
      view.getByTestId('tree-data').textContent ?? '[]',
    ) as Array<{
      title: string;
      value: string;
      children?: Array<{ title: string; value: string }>;
    }>;

    expect(treeData[0]?.children).toEqual([
      { title: '首个共享节点', value: 'shared' },
    ]);
    expect(treeData[1]?.children).toEqual([
      { title: '唯一节点', value: 'unique' },
    ]);
    expect(staticData[1].nodes).toHaveLength(2);
  });

  it('ignores a static self-reference without mutating the input', () => {
    type StaticNode = {
      id: string;
      label: string;
      nodes?: StaticNode[];
    };
    const selfNode: StaticNode = { id: 'self', label: '自环节点' };
    selfNode.nodes = [selfNode];

    const view = render(
      <TreeSelector
        data={[selfNode] as never}
        keys={['id', 'label', 'nodes']}
        showAll={false}
      />,
    );
    const treeData = JSON.parse(
      view.getByTestId('tree-data').textContent ?? '[]',
    );

    expect(treeData).toEqual([
      { title: '自环节点', value: 'self', children: [] },
    ]);
    expect(selfNode.nodes?.[0]).toBe(selfNode);
  });
});
