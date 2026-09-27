import { describe, expect, it } from 'vitest';
import {
  excludeTreeSubtree,
  filterTree,
  getDeleteBlockers,
  getSiblingMove,
  hasActualChildren,
  isTreeParentAllowed,
  type TreeOperationNode,
} from './treeOperations';

interface TestNode extends TreeOperationNode {
  id: string;
  name: string;
  children?: TestNode[];
}

const createTree = (): TestNode[] => [
  {
    id: 'root',
    name: '根节点',
    children: [
      { id: 'first', name: '第一节点', children: [] },
      {
        id: 'second',
        name: '第二节点',
        children: [{ id: 'leaf', name: '叶子节点' }],
      },
    ],
  },
  { id: 'other', name: '其他节点' },
];

describe('treeOperations', () => {
  it('仅将非空 children 视为有子节点', () => {
    expect(hasActualChildren({ id: 'empty', children: [] })).toBe(false);
    expect(hasActualChildren({ id: 'missing' })).toBe(false);
    expect(
      hasActualChildren({ id: 'parent', children: [{ id: 'child' }] }),
    ).toBe(true);
  });

  it('过滤时保留命中节点祖先且不修改输入', () => {
    const tree = createTree();
    const snapshot = structuredClone(tree);

    const result = filterTree(tree, (node) => node.name.includes('叶子'));

    expect(result).toEqual([
      {
        id: 'root',
        name: '根节点',
        children: [
          {
            id: 'second',
            name: '第二节点',
            children: [{ id: 'leaf', name: '叶子节点' }],
          },
        ],
      },
    ]);
    expect(tree).toEqual(snapshot);
  });

  it('排除当前节点时同时排除全部后代并保持输入不变', () => {
    const tree = createTree();
    const snapshot = structuredClone(tree);

    expect(excludeTreeSubtree(tree, 'second')).toEqual([
      {
        id: 'root',
        name: '根节点',
        children: [{ id: 'first', name: '第一节点' }],
      },
      { id: 'other', name: '其他节点' },
    ]);
    expect(tree).toEqual(snapshot);
  });

  it('拒绝选择自身或后代作为父节点', () => {
    const tree = createTree();

    expect(isTreeParentAllowed(tree, 'second', 'second')).toBe(false);
    expect(isTreeParentAllowed(tree, 'second', 'leaf')).toBe(false);
    expect(isTreeParentAllowed(tree, 'second', 'root')).toBe(true);
    expect(isTreeParentAllowed(tree, 'second', '0')).toBe(true);
  });

  it('按真实 ID 定位嵌套节点的同级移动目标', () => {
    const tree = createTree();

    expect(getSiblingMove(tree, 'second', 'up')).toMatchObject({
      current: { id: 'second' },
      target: { id: 'first' },
      currentIndex: 1,
      targetIndex: 0,
    });
    expect(getSiblingMove(tree, 'first', 'up')).toBeUndefined();
  });

  it('children 为空的叶子可删除，仅阻止真实父节点', () => {
    const tree = createTree();

    expect(getDeleteBlockers(tree, ['first', 'leaf'])).toEqual([]);
    expect(getDeleteBlockers(tree, ['second'])).toEqual([
      tree[0].children?.[1],
    ]);
  });

  it('遇到对象自环和跨分支重复 ID 时不会递归溢出并保留首个节点', () => {
    const cycle: TestNode = { id: 'cycle', name: '循环节点' };
    cycle.children = [cycle];
    const input: TestNode[] = [
      cycle,
      { id: 'branch', name: '分支', children: [{ id: 'cycle', name: '重复' }] },
    ];

    expect(excludeTreeSubtree(input)).toEqual([
      { id: 'cycle', name: '循环节点' },
      { id: 'branch', name: '分支' },
    ]);
    expect(cycle.children).toEqual([cycle]);
  });
});
