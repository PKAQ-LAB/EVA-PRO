import { request } from '@umijs/max';
import { TreeSelect, type TreeSelectProps } from 'antd';
import React, { useEffect, useState } from 'react';

interface TreeNode {
  title: React.ReactNode;
  value: string | number;
  children?: TreeNode[];
}

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
): TreeNode[] =>
  nodes.map((item) => {
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
      );
    }
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
  const [treeData, setTreeData] = useState<TreeNode[]>(data ?? []);

  useEffect(() => {
    if (url) {
      request<{ success?: boolean; data?: TreeNode[] }>(url)
        .then((response) => {
          if (response?.success) {
            const nodes = response.data ?? [];
            if (showAll) nodes.unshift({ title: '全部', value: '0' });
            setTreeData(nodes);
          }
        })
        .catch(() => {
          /* swallow */
        });
    } else if (data) {
      setTreeData(data);
    }
  }, [url, data, showAll]);

  const finalData = keys
    ? travelTreeData(
        treeData as unknown as Array<Record<string, unknown>>,
        keys[0],
        keys[1],
        keys[2],
      )
    : treeData;

  if (!treeData.length) return null;

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
