import { useIntl } from '@umijs/max';
import { App, Col, Form, Input, Modal, Row, Switch, TreeSelect } from 'antd';
import React, { useEffect, useState } from 'react';
import { DictSelector } from '@/components';
import { queryOrgs } from '../organization/service';
import { sysText } from '../status';
import type { RoleItem } from './data.d';
import { checkRoleUnique, saveRole } from './service';

export type ModalType = '' | 'create' | 'edit' | 'view';

export interface RoleAOEFormProps {
  modalType: ModalType;
  setModalType: (v: ModalType) => void;
  currentItem: Partial<RoleItem>;
  onSuccess: () => void;
}

const formItemLayout = {
  labelCol: { flex: '0 0 120px' },
  wrapperCol: { flex: 'auto' },
};

const isSystemRole = (record: Partial<RoleItem>) =>
  record.code === '9999' || record.frozen === 9999 || record.status === '9999';

const RoleAOEForm: React.FC<RoleAOEFormProps> = ({
  modalType,
  setModalType,
  currentItem,
  onSuccess,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm<RoleItem>();
  const { message: msg } = App.useApp();

  const [submitting, setSubmitting] = useState(false);
  const [orgs, setOrgs] = useState<unknown[]>([]);
  const [showDepts, setShowDepts] = useState(false);

  // 初始化 / 切换 currentItem
  useEffect(() => {
    if (modalType === '') return;
    form.resetFields();
    const init: Partial<RoleItem> = {
      frozen: 0,
      dataScope: '0000',
      ...currentItem,
    };
    if (!init.dataScope && init.dataPermissionType) {
      init.dataScope = init.dataPermissionType;
    }
    if (!init.dataOrgIds && init.dataPermissionDeptid) {
      init.dataOrgIds = init.dataPermissionDeptid;
    }
    if (typeof init.dataOrgIds === 'string' && init.dataOrgIds) {
      init.dataOrgIds = init.dataOrgIds.split(',');
    }
    form.setFieldsValue(init as RoleItem);

    const isCustomDept =
      (currentItem.dataScope ?? currentItem.dataPermissionType) === '0003';
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
    if (!res.success) {
      throw new Error(
        res.message ??
          sysText(intl, 'pages.sys.role.codeDuplicated', '编码已存在'),
      );
    }
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
        dataOrgIds: Array.isArray(values.dataOrgIds)
          ? values.dataOrgIds.join(',')
          : values.dataOrgIds,
      };
      const res = await saveRole(formData);
      if (res.success) {
        const action = sysText(
          intl,
          modalType === 'edit'
            ? 'pages.sys.action.edit'
            : 'pages.sys.action.add',
          modalType === 'edit' ? '编辑' : '新增',
        );
        msg.success(
          intl.formatMessage(
            {
              id: 'pages.sys.role.saveSuccess',
              defaultMessage: '{action}成功',
            },
            { action },
          ),
        );
        setModalType('');
        onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const readOnly = isSystemRole(currentItem);
  const disabled = modalType === 'view' || readOnly;

  return (
    <Modal
      maskClosable={false}
      confirmLoading={submitting}
      onCancel={() => setModalType('')}
      open={modalType !== ''}
      width={700}
      centered
      onOk={handleSaveClick}
      okButtonProps={{
        disabled,
        style: readOnly ? { display: 'none' } : undefined,
      }}
      title={sysText(
        intl,
        modalType === 'edit'
          ? 'pages.sys.role.editTitle'
          : modalType === 'view'
            ? 'pages.sys.role.viewTitle'
            : 'pages.sys.role.createTitle',
        modalType === 'edit'
          ? '编辑角色'
          : modalType === 'view'
            ? '查看角色'
            : '新增角色',
      )}
    >
      <Form colon form={form} layout="horizontal" {...formItemLayout}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={sysText(intl, 'pages.sys.role.name', '角色名称')}
              name="name"
              rules={[
                {
                  required: true,
                  message: sysText(
                    intl,
                    'pages.sys.role.nameRequired',
                    '请输入角色名称',
                  ),
                },
              ]}
            >
              <Input maxLength={30} disabled={disabled} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={sysText(intl, 'pages.sys.role.code', '角色编码')}
              name="code"
              validateTrigger="onBlur"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: sysText(
                    intl,
                    'pages.sys.role.codeRule',
                    '仅允许使用 4-30 位字母或数字',
                  ),
                  whitespace: true,
                  pattern: /^[0-9a-zA-Z_]{4,30}$/,
                },
                { validator: checkCode },
              ]}
            >
              <Input minLength={4} maxLength={30} disabled={disabled} />
            </Form.Item>
          </Col>
        </Row>
        {modalType !== 'create' && (
          <Form.Item
            label={sysText(intl, 'pages.sys.column.locked', '是否锁定')}
            name="frozen"
            getValueProps={(value) => ({ checked: value === 1 })}
            normalize={(checked) => (checked ? 1 : 0)}
          >
            <Switch
              checkedChildren={sysText(
                intl,
                'pages.sys.status.locked',
                '已锁定',
              )}
              unCheckedChildren={sysText(
                intl,
                'pages.sys.status.unlocked',
                '未锁定',
              )}
              disabled={disabled}
            />
          </Form.Item>
        )}
        <Form.Item
          label={sysText(intl, 'pages.sys.role.remark', '角色描述')}
          name="remark"
        >
          <Input.TextArea maxLength={60} disabled={disabled} />
        </Form.Item>
        <Form.Item
          label={sysText(intl, 'pages.sys.role.dataScope', '数据权限')}
          name="dataScope"
          rules={[{ required: true }]}
        >
          <DictSelector
            code="DATA_SCOPE"
            disabled={disabled}
            showall={false}
            onChange={(v) => handleDataPermissionChange(String(v))}
          />
        </Form.Item>
        {showDepts && (
          <Form.Item
            label={sysText(intl, 'pages.sys.role.dataOrgIds', '选择部门')}
            name="dataOrgIds"
          >
            <TreeSelect
              treeData={orgs as never}
              fieldNames={{ label: 'name', value: 'id', children: 'children' }}
              treeCheckable
              allowClear
              multiple
              disabled={disabled}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default RoleAOEForm;
