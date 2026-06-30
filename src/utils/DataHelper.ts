import React from 'react';
import { isUrl } from './utils';

interface MenuLike {
  icon?: string | React.ReactNode;
  children?: MenuLike[];
  [k: string]: unknown;
}

interface TreeLike {
  id: string | number;
  name?: string;
  code?: string;
  children?: TreeLike[];
  [k: string]: unknown;
}

interface ModuleLike {
  path: string;
  children?: ModuleLike[];
  [k: string]: unknown;
}

const isSameTreeId = (left: TreeLike['id'], right: TreeLike['id']) =>
  String(left) === String(right);

/**
 * 将后端返回的菜单 JSON 中字符串图标名替换为对应的 React 图标节点。
 * iconMap 可以由 src/appicon 提供（TASK-13 中迁入）。
 */
export function loopMenuItem<T extends MenuLike>(
  menus: T[] | undefined,
  iconMap: Record<string, React.ReactNode> = {},
): T[] {
  if (!menus) return [];
  return menus.map(({ icon, children, ...item }) => {
    const next: T = { ...(item as T) };
    if (typeof icon === 'string' && iconMap[icon]) {
      (next as MenuLike).icon = iconMap[icon];
    } else if (icon) {
      (next as MenuLike).icon = icon;
    }
    if (children) {
      (next as MenuLike).children = loopMenuItem(children as T[], iconMap);
    }
    return next;
  });
}

const filterID = (
  data: TreeLike[],
  id: TreeLike['id'],
  itemArray: string[],
): void => {
  data.forEach((item) => {
    if (isSameTreeId(item.id, id)) {
      if (item.children && item.name) itemArray.push(item.name);
    } else if (item.children) {
      filterID(item.children, id, itemArray);
    }
  });
};

export function hasChildren(
  data: TreeLike[],
  idArray: Array<TreeLike['id']>,
): string {
  const itemArray: string[] = [];
  for (const id of idArray) {
    filterID(data, id, itemArray);
  }
  return itemArray.join(',');
}

/** 取第一个叶子节点的 path */
export function getFirstLeaf(data: ModuleLike[]): string {
  const head = data[0];
  if (!head) return '';
  return head.children ? getFirstLeaf(head.children) : head.path;
}

/** 获取兄弟节点 */
export function getNodeBorther(
  data: TreeLike[],
  targetPid: TreeLike['id'] | '' | '-',
): TreeLike[] {
  if (
    targetPid === '0' ||
    targetPid === 0 ||
    targetPid === '-' ||
    targetPid === '' ||
    !targetPid
  ) {
    return [...data];
  }
  let dude: TreeLike[] = [];
  if (data && data.length > 0) {
    data.forEach((item) => {
      if (isSameTreeId(item.id, targetPid) && item.children) {
        dude = [...item.children];
      } else if (item.children) {
        const found = getNodeBorther(item.children, targetPid);
        if (found.length) dude = found;
      }
    });
  }
  return dude;
}

/** 拼接绝对 path（递归处理子节点） */
export function moudleFormatter<T extends ModuleLike>(
  data: T[],
  parentPath = '/',
): T[] {
  return data.map((item) => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result: T = { ...(item as T), path };
    if (item.children) {
      (result as ModuleLike).children = moudleFormatter(
        item.children,
        `${parentPath}${item.path}/`,
      );
    }
    return result;
  });
}

/** 字典数据按文本过滤（递归） */
export function dictFilter(
  data: TreeLike[] | undefined,
  searchText: string,
): TreeLike[] {
  if (!data) return [];
  // V6 推荐 structuredClone 替代 lodash.cloneDeep
  const tempData: TreeLike[] = structuredClone(data);

  return tempData.filter((node) => {
    if (searchText && searchText.length > 0) {
      if (node.children) {
        node.children = dictFilter(node.children, searchText);
      }
      const matchName = node.name ? node.name.search(searchText) !== -1 : false;
      const matchCode = node.code ? node.code.search(searchText) !== -1 : false;
      return (
        matchName || matchCode || (node.children && node.children.length > 0)
      );
    }
    return true;
  });
}
