import { Alert, Button, Empty, Modal, Skeleton, Space, Table } from 'antd';
import { useEffect, useState } from 'react';
import { TextCell, textColumn } from '@/components/TablePresentation';
import type { RoleModuleNode, RoleModuleResponse } from '../role/data.d';
import { listRoleModules } from '../role/service';
import type { RoleItem } from './data.d';

interface GrantedNode extends RoleModuleNode {
  granted: boolean;
  children?: GrantedNode[];
}

function grantedTree(
  data: NonNullable<RoleModuleResponse['data']>,
): GrantedNode[] {
  const checked = new Set(data.checked ?? []);
  const visit = (nodes: RoleModuleNode[]): GrantedNode[] =>
    nodes.flatMap((node) => {
      const selected = new Set(
        (data.checkedResource?.[node.id] ?? []).map(String),
      );
      const resources = (node.resources ?? []).filter((resource) =>
        selected.has(resource.id),
      );
      const children = visit(node.children ?? []);
      const granted = checked.has(node.id) || resources.length > 0;
      if (!granted && !children.length) return [];
      // 父目录只为保留结构，不把候选节点或资源当成该角色的授权。
      return [
        {
          ...node,
          resources,
          children: children.length ? children : undefined,
          granted,
        },
      ];
    });
  return visit(data.modules ?? []);
}

export default function RoleModulesView({
  role,
  onClose,
}: {
  role: RoleItem;
  onClose: () => void;
}) {
  const [state, setState] = useState<{
    loading: boolean;
    records: GrantedNode[];
    error?: string;
  }>({ loading: true, records: [] });
  const roleId = role.id;
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    setState({ loading: true, records: [] });
    setExpandedKeys([]);
    if (!roleId?.trim()) {
      setState({
        loading: false,
        records: [],
        error: '角色编号缺失，无法读取模块权限',
      });
      return () => {
        active = false;
      };
    }
    void listRoleModules(roleId)
      .then((response) => {
        if (!active) return;
        if (response.success !== true || !response.data) throw new Error();
        const records = grantedTree(response.data);
        const parentKeys = (nodes: GrantedNode[]): string[] =>
          nodes.flatMap((node) =>
            node.children?.length
              ? [node.id, ...parentKeys(node.children)]
              : [],
          );
        setExpandedKeys(parentKeys(records));
        setState({ loading: false, records });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const status = (error as { response?: { status?: number } } | undefined)
          ?.response?.status;
        setState({
          loading: false,
          records: [],
          error:
            status === 403
              ? '无权限查看此角色模块权限'
              : '模块权限加载失败，请稍后重试',
        });
      });
    return () => {
      active = false;
    };
  }, [roleId]);

  return (
    <Modal
      open
      title={`${role.name || '—'} · 模块权限（只读）`}
      width={860}
      centered
      mask={{ closable: false }}
      onCancel={onClose}
      styles={{ body: { maxHeight: '65vh', overflow: 'auto' } }}
      footer={
        <Button htmlType="button" onClick={onClose}>
          关闭权限查看
        </Button>
      }
    >
      <div aria-busy={state.loading} style={{ minHeight: 320 }}>
        <Table<GrantedNode>
          size="small"
          rowKey="id"
          dataSource={state.records}
          pagination={false}
          title={
            state.error
              ? () => (
                  <Alert
                    className="eva-view-notice"
                    type="error"
                    showIcon
                    title={state.error}
                  />
                )
              : undefined
          }
          locale={{
            emptyText: state.loading ? (
              <div>
                <div role="status">加载中...</div>
                <div aria-hidden="true">
                  <Skeleton active title={false} paragraph={{ rows: 3 }} />
                </div>
              </div>
            ) : state.error ? (
              <span />
            ) : (
              <Empty description="暂无已授予模块权限" />
            ),
          }}
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpandedRowsChange: (keys) => setExpandedKeys(keys.map(String)),
          }}
          scroll={{ x: 720 }}
          columns={[
            textColumn<GrantedNode>('模块名称', 'name', 240),
            {
              title: '授权情况',
              width: 110,
              align: 'center',
              render: (_, node) => (node.granted ? '已授权' : '上级目录'),
            },
            {
              title: '已授予资源',
              render: (_, node) => (
                <Space wrap>
                  {node.resources?.length
                    ? node.resources.map((resource) => (
                        <TextCell
                          key={resource.id}
                          text={resource.resourceDesc}
                          maxWidth={260}
                        />
                      ))
                    : '—'}
                </Space>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
}
