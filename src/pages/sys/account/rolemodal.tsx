import {
  Alert,
  App,
  Button,
  Modal,
  Spin,
  Transfer,
  type TransferProps,
} from 'antd';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { AccountItem, RoleItem } from './data.d';
import { grantAccountRoles } from './service';

export interface RoleModalProps {
  open: boolean;
  targetId: string;
  onClose: () => void;
  roles: RoleItem[];
  currentItem: AccountItem | null;
  detailsLoading?: boolean;
  detailsError?: string;
  onRetryDetails?: () => void;
  rolesLoading?: boolean;
  rolesError?: boolean;
  onRetryRoles?: () => void;
}

interface TransferRecord {
  key: string;
  title: string;
  description: string;
}

const RoleModal: React.FC<RoleModalProps> = ({
  open,
  targetId,
  onClose,
  roles,
  currentItem,
  detailsLoading = false,
  detailsError,
  onRetryDetails,
  rolesLoading = false,
  rolesError = false,
  onRetryRoles,
}) => {
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectionReady, setSelectionReady] = useState(false);
  const initialized = useRef(false);
  const session = useRef(0);
  const savingRef = useRef(false);
  useLayoutEffect(() => {
    session.current += 1;
    initialized.current = false;
    savingRef.current = false;
    setSaving(false);
    setSelectionReady(false);
    setSelectedRoles([]);
    return () => {
      session.current += 1;
    };
  }, [open, targetId]);
  useEffect(() => {
    if (
      !open ||
      detailsLoading ||
      detailsError ||
      currentItem?.id !== targetId ||
      initialized.current
    )
      return;
    // 同一目标只初始化一次，候选刷新或迟到的详情对象不得覆盖用户已改的勾选。
    initialized.current = true;
    setSelectedRoles(currentItem?.roles?.map((role) => role.id) ?? []);
    setSelectionReady(true);
  }, [open, targetId, currentItem, detailsLoading, detailsError]);
  const unavailable =
    !open ||
    !targetId ||
    detailsLoading ||
    Boolean(detailsError) ||
    rolesLoading ||
    rolesError ||
    !selectionReady ||
    currentItem?.id !== targetId ||
    currentItem?.frozen === 1 ||
    currentItem?.frozen === 9999;

  const dataSource: TransferRecord[] = roles.map((r) => ({
    key: r.id,
    title: r.name,
    description: r.name,
  }));

  const handleSubmit = async () => {
    if (unavailable || savingRef.current) return;
    const request = session.current;
    savingRef.current = true;
    setSaving(true);
    try {
      const res = await grantAccountRoles(
        targetId,
        selectedRoles.map((id) => ({ id })),
      );
      if (request !== session.current) return;
      if (res.success) {
        message.success('授权成功');
        onClose();
      } else message.error('授权失败，请重试');
    } catch {
      if (request === session.current) message.error('授权失败，请重试');
    } finally {
      if (request === session.current) {
        savingRef.current = false;
        setSaving(false);
      }
    }
  };

  const onChange: TransferProps['onChange'] = (nextTargetKeys) => {
    if (unavailable || savingRef.current) return;
    setSelectedRoles(nextTargetKeys.map(String));
  };

  return (
    <Modal
      open={open}
      title="选择授权角色"
      okText="确定"
      cancelText="关闭"
      maskClosable={false}
      width="45%"
      centered
      confirmLoading={saving}
      okButtonProps={{ disabled: unavailable || saving }}
      cancelButtonProps={{ disabled: saving }}
      closable={!saving}
      keyboard={!saving}
      onOk={handleSubmit}
      onCancel={() => {
        if (!savingRef.current) onClose();
      }}
      styles={{ body: { height: 456, padding: 0, overflowY: 'auto' } }}
    >
      {detailsError && (
        <Alert
          className="eva-view-notice"
          type="error"
          showIcon
          title={detailsError}
          action={<Button onClick={onRetryDetails}>重试用户角色</Button>}
        />
      )}
      {rolesError && (
        <Alert
          className="eva-view-notice"
          type="error"
          showIcon
          title="角色列表加载失败"
          action={<Button onClick={onRetryRoles}>重试候选角色</Button>}
        />
      )}
      {(detailsLoading ||
        rolesLoading ||
        (!selectionReady && !detailsError && !rolesError)) && (
        <Spin description="加载中...">
          <div style={{ minHeight: 100 }} />
        </Spin>
      )}
      {selectionReady &&
        !detailsLoading &&
        !detailsError &&
        !rolesLoading &&
        !rolesError && (
          <Transfer<TransferRecord>
            disabled={unavailable || saving}
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            render={(item) => item.title}
            listStyle={{ width: '45%', height: '90%' }}
            dataSource={dataSource}
            targetKeys={selectedRoles}
            onChange={onChange}
            titles={['可选角色', '已选角色']}
          />
        )}
    </Modal>
  );
};

export default RoleModal;
