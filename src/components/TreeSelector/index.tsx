import { request } from '@umijs/max';
import { TreeSelect, type TreeSelectProps } from 'antd';
import React, { useEffect, useState } from 'react';

interface TreeNode {
  title: React.ReactNode;
  value: string | number;
  children?: TreeNode[];
}

const deduplicateTreeNodes = (
  nodes: TreeNode[],
  seenValues = new Set<string>(),
): TreeNode[] =>
  nodes.flatMap((node) => {
    const value = String(node.value);
    if (seenValues.has(value)) return [];
    seenValues.add(value);

    const next = { ...node };
    if (node.children) {
      next.children = deduplicateTreeNodes(node.children, seenValues);
    }
    return [next];
  });

export interface TreeSelectorProps
  extends Omit<TreeSelectProps, 'treeData' | 'treeNodeFilterProp'> {
  /** 远程数据 URL；若提供则忽略 data prop 中的初始值 */
  url?: string;
  /** 静态数据 */
  data?: TreeNode[];
  /** [valueKey, titleKey, childrenKey] 字段映射 */
  keys?: [string, string, string];
  /** 在结果前插入 "全部" 节点 */
  showAll?: boolean;
  /** 启用搜索 */
  search?: boolean;
}

const travelTreeData = (
  nodes: Array<Record<string, unknown>>,
  valueKey: string,
  titleKey: string,
  childrenKey: string,
  ancestorObjects = new WeakSet<object>(),
): TreeNode[] =>
  nodes.flatMap((item) => {
    if (ancestorObjects.has(item)) return [];
    ancestorObjects.add(item);

    const node: TreeNode = {
      title: item[titleKey] as React.ReactNode,
      value: item[valueKey] as string | number,
    };
    const children = item[childrenKey];
    if (Array.isArray(children) && children.length > 0) {
      node.children = travelTreeData(
        children as Array<Record<string, unknown>>,
        valueKey,
        titleKey,
        childrenKey,
        ancestorObjects,
      );
    }
    ancestorObjects.delete(item);
    return node;
  });

/**
 * 远程获取树形结构下拉菜单
 */
const TreeSelector: React.FC<TreeSelectorProps> = ({
  url,
  data,
  keys,
  showAll = true,
  search = false,
  ...rest
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>(() => [...(data ?? [])]);

  useEffect(() => {
    if (url) {
      request<{ success?: boolean; data?: TreeNode[] }>(url)
        .then((response) => {
          if (response?.success) {
            const nodes = [
              ...(showAll ? [{ title: '全部', value: '0' }] : []),
              ...(response.data ?? []),
            ];
            setTreeData(nodes);
          }
        })
        .catch(() => {
          /* swallow */
        });
    } else if (data) {
      setTreeData([...data]);
    }
  }, [url, data, showAll]);

  const mappedData = keys
    ? travelTreeData(
        treeData as unknown as Array<Record<string, unknown>>,
        keys[0],
        keys[1],
        keys[2],
      )
    : treeData;
  const finalData = deduplicateTreeNodes(mappedData);

  if (!finalData.length) return null;

  const searchProps: Pick<TreeSelectProps, 'showSearch' | 'filterTreeNode'> =
    search
      ? {
          showSearch: true,
          filterTreeNode: (val, node) =>
            new RegExp(val, 'i').test(
              `${(node as { value?: unknown }).value ?? ''}${
                (node as { title?: unknown }).title ?? ''
              }`,
            ),
        }
      : {};

  return <TreeSelect {...rest} {...searchProps} treeData={finalData} />;
};

export default TreeSelector;
