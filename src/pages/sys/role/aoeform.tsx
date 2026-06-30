import { useModel } from '@umijs/max';
import { App, Col, Form, Input, Modal, Row, TreeSelect } from 'antd';
import React, { useEffect, useState } from 'react';
import { DictSelector } from '@/components';
import { queryOrgs } from '../organization/service';
import type { RoleItem } from './data.d';
import { checkRoleUnique, saveRole } from './service';

export type ModalType = '' | 'create' | 'edit' | 'view';

export interface RoleAOEFormProps {
  modalType: ModalType;
  setModalType: (v: ModalType) => void;
  currentItem: Partial<RoleItem>;
  onSuccess: () => void;
}

const TITLE: Record<Exclude<ModalType, ''>, string> = {
  create: '新增',
  edit: '编辑',
  view: '查看',
};

const formItemLayout = {
  labelCol: { flex: '0 0 120px' },
  wrapperCol: { flex: 'auto' },
};

const RoleAOEForm: React.FC<RoleAOEFormProps> = ({
  modalType,
  setModalType,
  currentItem,
  onSuccess,
}) => {
  const [form] = Form.useForm<RoleItem>();
  const { message: msg } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const dataPermissionDict = (
    initialState?.dict as Record<string, unknown> | undefined
  )?.data_permission as Record<string, string> | undefined;

  const [submitting, setSubmitting] = useState(false);
  const [orgs, setOrgs] = useState<unknown[]>([]);
  const [showDepts, setShowDepts] = useState(false);

  // 初始化 / 切换 currentItem
  useEffect(() => {
    if (modalType === '') return;
    form.resetFields();
    const init: Partial<RoleItem> = { ...currentItem };
    if (
      typeof init.dataPermissionDeptid === 'string' &&
      init.dataPermissionDeptid
    ) {
      init.dataPermissionDeptid = init.dataPermissionDeptid.split(',');
    }
    form.setFieldsValue(init as RoleItem);

    const isCustomDept = currentItem.dataPermissionType === '0003';
    setShowDepts(isCustomDept);
    if (isCustomDept) {
      queryOrgs().then((res) => {
        if (res.success && res.data) setOrgs(res.data);
      });
    }
  }, [modalType, currentItem, form]);

  const checkCode = async (_: unknown, code: string) => {
    if (currentItem?.id && code === currentItem.code) return;
    const res = await checkRoleUnique(code);
    if (!res.success) throw new Error(res.message ?? '编码已存在');
  };

  const handleDataPermissionChange = async (v: string) => {
    const isCustom = v === '0003';
    setShowDepts(isCustom);
    if (isCustom) {
      const res = await queryOrgs();
      if (res.success && res.data) setOrgs(res.data);
    }
  };

  const handleSaveClick = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const formData: Partial<RoleItem> = {
        ...values,
        id: currentItem.id,
        dataPermissionDeptid: Array.isArray(values.dataPermissionDeptid)
          ? values.dataPermissionDeptid.join(',')
          : values.dataPermissionDeptid,
      };
      const res = await saveRole(formData);
      if (res.success) {
        msg.success(`${TITLE[modalType as Exclude<ModalType, ''>]}成功`);
        setModalType('');
        onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      maskClosable={false}
      confirmLoading={submitting}
      onCancel={() => setModalType('')}
      open={modalType !== ''}
      width={700}
      centered
      onOk={handleSaveClick}
      title={`${TITLE[modalType as 'create' | 'edit' | 'view'] ?? ''}角色`}
    >
      <Form colon form={form} layout="horizontal" {...formItemLayout}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="角色名称"
              name="name"
              rules={[{ required: true }]}
            >
              <Input maxLength={30} disabled={modalType === 'view'} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="角色编码"
              name="code"
              validateTrigger="onBlur"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: '仅允许使用 4-30 位字母或数字',
                  whitespace: true,
                  pattern: /^[0-9a-zA-Z_]{4,30}$/,
                },
                { validator: checkCode },
              ]}
            >
              <Input
                minLength={4}
                maxLength={30}
                disabled={modalType === 'view'}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="角色描述" name="remark">
          <Input.TextArea maxLength={60} disabled={modalType === 'view'} />
        </Form.Item>
        <Form.Item
          label="数据权限"
          name="dataPermissionType"
          rules={[{ required: true }]}
        >
          <DictSelector
            data={dataPermissionDict}
            disabled={modalType === 'view'}
            onChange={(v) => handleDataPermissionChange(String(v))}
          />
        </Form.Item>
        {showDepts && (
          <Form.Item label="选择部门" name="dataPermissionDeptid">
            <TreeSelect
              treeData={orgs as never}
              fieldNames={{ label: 'name', value: 'id', children: 'children' }}
              treeCheckable
              allowClear
              multiple
              disabled={modalType === 'view'}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default RoleAOEForm;
