export interface TreeOperationNode {
  id?: string | number;
  name?: string;
  children?: TreeOperationNode[];
}

export type TreeMoveDirection = 'up' | 'down';

export interface TreeSiblingMove<T> {
  current: T;
  target: T;
  currentIndex: number;
  targetIndex: number;
}

const normalizeTreeId = (id: unknown): string | undefined => {
  if (id === undefined || id === null || id === '') {
    return undefined;
  }
  return String(id);
};

export const hasActualChildren = (node: TreeOperationNode): boolean =>
  Array.isArray(node.children) && node.children.length > 0;

const cloneTree = <T extends TreeOperationNode>(
  nodes: T[],
  options: {
    excludedId?: string;
    predicate?: (node: T) => boolean;
  } = {},
): T[] => {
  const seenIds = new Set<string>();
  const ancestors = new Set<object>();

  const visit = (items: T[]): T[] =>
    items.flatMap((node) => {
      if (!node || typeof node !== 'object' || ancestors.has(node)) {
        return [];
      }

      const id = normalizeTreeId(node.id);
      if (id && (id === options.excludedId || seenIds.has(id))) {
        return [];
      }
      if (id) {
        seenIds.add(id);
      }

      ancestors.add(node);
      const children = visit(
        (Array.isArray(node.children) ? node.children : []) as T[],
      );
      ancestors.delete(node);

      if (
        options.predicate &&
        !options.predicate(node) &&
        children.length === 0
      ) {
        return [];
      }

      const { children: _children, ...rest } = node;
      return [
        {
          ...rest,
          ...(children.length > 0 ? { children } : {}),
        } as T,
      ];
    });

  return visit(nodes);
};

/**
 * 过滤树时保留命中节点的祖先，并始终返回新对象。
 */
export const filterTree = <T extends TreeOperationNode>(
  nodes: T[],
  predicate: (node: T) => boolean,
): T[] => cloneTree(nodes, { predicate });

/**
 * 从父节点候选树中移除当前节点及其全部后代。
 */
export const excludeTreeSubtree = <T extends TreeOperationNode>(
  nodes: T[],
  excludedId?: string | number,
): T[] =>
  cloneTree(nodes, {
    excludedId: normalizeTreeId(excludedId),
  });

export const findTreeNode = <T extends TreeOperationNode>(
  nodes: T[],
  nodeId?: string | number,
): T | undefined => {
  const targetId = normalizeTreeId(nodeId);
  if (!targetId) {
    return undefined;
  }

  const seenIds = new Set<string>();
  const ancestors = new Set<object>();

  const visit = (items: T[]): T | undefined => {
    for (const node of items) {
      if (!node || typeof node !== 'object' || ancestors.has(node)) {
        continue;
      }

      const id = normalizeTreeId(node.id);
      if (id && seenIds.has(id)) {
        continue;
      }
      if (id) {
        seenIds.add(id);
      }
      if (id === targetId) {
        return node;
      }

      ancestors.add(node);
      const result = visit(
        (Array.isArray(node.children) ? node.children : []) as T[],
      );
      ancestors.delete(node);
      if (result) {
        return result;
      }
    }
    return undefined;
  };

  return visit(nodes);
};

/**
 * 校验新的父节点不是当前节点本身或其任意后代。
 */
export const isTreeParentAllowed = <T extends TreeOperationNode>(
  nodes: T[],
  nodeId?: string | number,
  parentId?: string | number,
): boolean => {
  const currentId = normalizeTreeId(nodeId);
  const nextParentId = normalizeTreeId(parentId);
  if (!currentId || !nextParentId || nextParentId === '0') {
    return true;
  }
  if (currentId === nextParentId) {
    return false;
  }

  const currentNode = findTreeNode(nodes, currentId);
  if (!currentNode) {
    return true;
  }
  return !findTreeNode(
    (Array.isArray(currentNode.children) ? currentNode.children : []) as T[],
    nextParentId,
  );
};

export const getDeleteBlockers = <T extends TreeOperationNode>(
  nodes: T[],
  selectedIds: Array<string | number>,
): T[] => {
  const selected = new Set(selectedIds.map(String));
  const blockers: T[] = [];
  const seenIds = new Set<string>();
  const ancestors = new Set<object>();

  const visit = (items: T[]) => {
    items.forEach((node) => {
      if (!node || typeof node !== 'object' || ancestors.has(node)) {
        return;
      }

      const id = normalizeTreeId(node.id);
      if (id && seenIds.has(id)) {
        return;
      }
      if (id) {
        seenIds.add(id);
      }
      if (id && selected.has(id) && hasActualChildren(node)) {
        blockers.push(node);
      }

      ancestors.add(node);
      visit((Array.isArray(node.children) ? node.children : []) as T[]);
      ancestors.delete(node);
    });
  };

  visit(nodes);
  return blockers;
};

/**
 * 按节点真实 ID 定位同级移动目标，避免使用过滤列表或表格渲染索引。
 */
export const getSiblingMove = <T extends TreeOperationNode>(
  nodes: T[],
  nodeId: string | number,
  direction: TreeMoveDirection,
): TreeSiblingMove<T> | undefined => {
  const targetId = normalizeTreeId(nodeId);
  if (!targetId) {
    return undefined;
  }

  const seenIds = new Set<string>();
  const ancestors = new Set<object>();

  const visit = (siblings: T[]): TreeSiblingMove<T> | undefined => {
    for (let index = 0; index < siblings.length; index += 1) {
      const node = siblings[index];
      if (!node || typeof node !== 'object' || ancestors.has(node)) {
        continue;
      }

      const id = normalizeTreeId(node.id);
      if (id && seenIds.has(id)) {
        continue;
      }
      if (id) {
        seenIds.add(id);
      }
      if (id === targetId) {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const target = siblings[targetIndex];
        if (!target) {
          return undefined;
        }
        return {
          current: node,
          target,
          currentIndex: index,
          targetIndex,
        };
      }

      ancestors.add(node);
      const result = visit(
        (Array.isArray(node.children) ? node.children : []) as T[],
      );
      ancestors.delete(node);
      if (result) {
        return result;
      }
    }
    return undefined;
  };

  return visit(nodes);
};
