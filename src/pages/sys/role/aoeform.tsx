import { useIntl } from '@umijs/max';
import {
  Alert,
  App,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Switch,
  TreeSelect,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { DictSelector } from '@/components';
import useFormDialogStyles from '@/components/FormDialog/useStyles';
import RecordAuditFields from '@/components/RecordAuditFields';
import { findTreeNode } from '@/utils/treeOperations';
import useLeaveGuard from '../account/useLeaveGuard';
import type { OrgItem } from '../organization/data.d';
import { queryOrgs } from '../organization/service';
import { frozenText, sysText } from '../status';
import type { RoleItem } from './data.d';
import { checkRoleUnique, saveRole } from './service';

export type ModalType = '' | 'create' | 'edit' | 'view';

export interface RoleAOEFormProps {
  modalType: ModalType;
  setModalType: (v: ModalType) => void;
  currentItem: Partial<RoleItem>;
  onSuccess: () => void;
  detailsLoading?: boolean;
  detailsError?: string;
}

const formItemLayout = {
  labelCol: { flex: '0 0 120px' },
  wrapperCol: { flex: 'auto' },
};
const remarkStyle: React.CSSProperties & { '--eva-view-rows': number } = {
  '--eva-view-rows': 2,
};

const isSystemRole = (record: Partial<RoleItem>) =>
  record.code === '9999' || record.frozen === 9999 || record.status === '9999';

const RoleAOEForm: React.FC<RoleAOEFormProps> = ({
  modalType,
  setModalType,
  currentItem,
  onSuccess,
  detailsLoading = false,
  detailsError,
}) => {
  const intl = useIntl();
  const dialogStyles = useFormDialogStyles();
  const [form] = Form.useForm<RoleItem>();
  const { message: msg, modal } = App.useApp();

  const [submitting, setSubmitting] = useState(false);
  const savingRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const isView = modalType === 'view';
  const readOnly = isSystemRole(currentItem);
  const disabled =
    isView || readOnly || submitting || detailsLoading || Boolean(detailsError);
  const leaveGuard = useLeaveGuard({
    identity: `${modalType}:${currentItem.id ?? ''}`,
    dirty: !isView && dirty,
    busy: !isView && submitting,
    isBusy: () => savingRef.current,
    onClose: () => setModalType(''),
    onClean: () => setDirty(false),
    onBlocked: () => msg.info('加载中...'),
    modal,
  });
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [showDepts, setShowDepts] = useState(false);
  const scope = Object.hasOwn(currentItem, 'dataScope')
    ? currentItem.dataScope
    : currentItem.dataPermissionType;
  const selectedOrgs = Object.hasOwn(currentItem, 'dataOrgIds')
    ? currentItem.dataOrgIds
    : currentItem.dataPermissionDeptid;
  const orgIds = Array.isArray(selectedOrgs)
    ? selectedOrgs
    : (selectedOrgs?.split(',').filter(Boolean) ?? []);
  const renderValue = (
    value: React.ReactNode,
    multiline = false,
    loading = detailsLoading,
  ) => (
    <div
      className={`eva-view-value${multiline ? ' eva-view-value-multiline' : ''}`}
      style={multiline ? remarkStyle : undefined}
      aria-busy={loading && !detailsError}
    >
      {loading || detailsError ? (
        <Skeleton.Node
          active={loading && !detailsError}
          styles={{
            root: { width: '100%' },
            content: {
              width: '100%',
              height: multiline
                ? 'calc(var(--ant-font-height, 22px) * 2)'
                : 'var(--ant-font-height, 22px)',
            },
          }}
        />
      ) : (
        value
      )}
    </div>
  );
  const departmentField = (
    <Form.Item label={sysText(intl, 'pages.sys.role.dataOrgIds', '选择部门')}>
      {renderValue(
        orgIds.length
          ? orgIds.map((id) => findTreeNode(orgs, id)?.name || '—').join('、')
          : '—',
        false,
        detailsLoading || orgsLoading,
      )}
    </Form.Item>
  );

  // 初始化 / 切换 currentItem
  useEffect(() => {
    if (modalType === '') return;
    if (!isView && !detailsLoading && !detailsError) form.resetFields();
    setDirty(false);
    savingRef.current = false;
    setSubmitting(false);
    setOrgs([]);
    const init: Partial<RoleItem> = {
      frozen: 0,
      ...currentItem,
      dataScope: Object.hasOwn(currentItem, 'dataScope')
        ? currentItem.dataScope
        : currentItem.dataPermissionType,
      dataOrgIds: Object.hasOwn(currentItem, 'dataOrgIds')
        ? currentItem.dataOrgIds
        : currentItem.dataPermissionDeptid,
    };
    if (typeof init.dataOrgIds === 'string' && init.dataOrgIds) {
      init.dataOrgIds = init.dataOrgIds.split(',');
    }
    if (!isView && !detailsLoading && !detailsError)
      form.setFieldsValue(init as RoleItem);

    const isCustomDept = init.dataScope === '0003';
    setShowDepts(isCustomDept);
    let active = true;
    setOrgsLoading(isCustomDept && !detailsLoading && !detailsError);
    if (isCustomDept && !detailsLoading && !detailsError) {
      queryOrgs()
        .then((res) => {
          if (active && res.success && res.data) setOrgs(res.data);
        })
        .catch(() => {
          if (active) msg.error('部门信息加载失败，请重试');
        })
        .finally(() => {
          if (active) setOrgsLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [modalType, currentItem, form, detailsLoading, detailsError, msg, isView]);

  const checkCode = async (_: unknown, code: string) => {
    if (isView || readOnly || detailsLoading || detailsError) return;
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
    if (disabled || !leaveGuard.isCurrent()) return;
    const isCustom = v === '0003';
    setShowDepts(isCustom);
    if (isCustom) {
      try {
        const res = await queryOrgs();
        if (leaveGuard.isCurrent() && res.success && res.data)
          setOrgs(res.data);
      } catch {
        if (leaveGuard.isCurrent()) msg.error('部门信息加载失败，请重试');
      }
    }
  };

  const handleSaveClick = async () => {
    if (
      (modalType !== 'create' && modalType !== 'edit') ||
      disabled ||
      savingRef.current
    )
      return;
    savingRef.current = true;
    setSubmitting(true);
    try {
      const values = await form.validateFields().catch((error: unknown) => {
        if (error && typeof error === 'object' && 'errorFields' in error) {
          return undefined;
        }
        throw error;
      });
      if (!values || !leaveGuard.isCurrent()) return;
      // 隐藏部门控件时，validateFields不会返回该字段，仍须保留详情中的组织关联。
      const dataOrgIds: RoleItem['dataOrgIds'] =
        form.getFieldValue('dataOrgIds');
      const formData: Partial<RoleItem> = {
        name: values.name,
        code: values.code,
        remark: values.remark,
        frozen: values.frozen,
        dataScope: values.dataScope,
        id: currentItem.id,
        dataOrgIds: Array.isArray(dataOrgIds)
          ? dataOrgIds.join(',')
          : dataOrgIds,
      };
      const res = await saveRole(formData);
      if (!leaveGuard.isCurrent()) return;
      if (res.success) {
        leaveGuard.release();
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
      } else {
        msg.error(res.message ?? '保存失败，请重试');
      }
    } catch {
      if (leaveGuard.isCurrent()) msg.error('保存失败，请重试');
    } finally {
      if (leaveGuard.isCurrent()) {
        savingRef.current = false;
        setSubmitting(false);
      }
    }
  };

  return (
    <Modal
      styles={dialogStyles}
      mask={{ closable: false }}
      closable={!submitting}
      keyboard={!submitting}
      confirmLoading={submitting}
      onCancel={isView ? () => setModalType('') : leaveGuard.requestClose}
      open={modalType !== ''}
      width={700}
      centered
      onOk={handleSaveClick}
      footer={
        isView ? (
          <Button onClick={() => setModalType('')}>关闭</Button>
        ) : undefined
      }
      cancelButtonProps={{ disabled: submitting }}
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
      {detailsError && (
        <Alert
          className="eva-view-notice"
          type="error"
          showIcon
          title={detailsError}
        />
      )}
      {isView || detailsLoading || detailsError ? (
        <Form
          key={isView ? 'view' : 'pending'}
          component="div"
          colon
          layout="horizontal"
          {...formItemLayout}
          aria-busy={detailsLoading && !detailsError}
        >
          {detailsLoading && !detailsError && (
            <span role="status" aria-label="加载中..." />
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={sysText(intl, 'pages.sys.role.name', '角色名称')}
              >
                {renderValue(currentItem.name?.trim() || '—')}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={sysText(intl, 'pages.sys.role.code', '角色编码')}
              >
                {renderValue(currentItem.code?.trim() || '—')}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={sysText(intl, 'pages.sys.column.locked', '是否锁定')}
          >
            {renderValue(
              currentItem.frozen == null
                ? '—'
                : frozenText(intl, currentItem.frozen),
            )}
          </Form.Item>
          <Form.Item label={sysText(intl, 'pages.sys.role.remark', '角色描述')}>
            {renderValue(currentItem.remark?.trim() || '—', true)}
          </Form.Item>
          <Form.Item
            label={sysText(intl, 'pages.sys.role.dataScope', '数据权限')}
          >
            {renderValue(scope?.trim() || '—')}
          </Form.Item>
          {isView ? (
            <div
              data-role-department-region
              style={{
                minHeight:
                  'calc(var(--ant-control-height, 32px) + var(--ant-margin-lg, 24px))',
              }}
              aria-busy={detailsLoading && !detailsError}
              aria-hidden={
                !detailsLoading && !detailsError && scope !== '0003'
                  ? true
                  : undefined
              }
            >
              {detailsLoading || detailsError ? (
                <div
                  style={{
                    display: 'flex',
                    paddingBlockEnd: 'var(--ant-margin-lg, 24px)',
                  }}
                >
                  <div
                    style={{ flex: formItemLayout.labelCol.flex }}
                    aria-hidden
                  />
                  <div
                    style={{
                      flex: formItemLayout.wrapperCol.flex,
                      minWidth: 0,
                    }}
                  >
                    {renderValue(null, false, detailsLoading)}
                  </div>
                </div>
              ) : scope === '0003' ? (
                departmentField
              ) : null}
            </div>
          ) : scope === '0003' ? (
            departmentField
          ) : null}
          {isView && (
            <RecordAuditFields
              record={currentItem}
              loading={detailsLoading}
              unavailable={Boolean(detailsError)}
            />
          )}
        </Form>
      ) : (
        <Form
          key="write"
          colon
          form={form}
          disabled={disabled}
          layout="horizontal"
          {...formItemLayout}
          onValuesChange={() => {
            if (!disabled) setDirty(true);
          }}
          onSubmitCapture={(event) => {
            if (isView) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
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
            rules={[
              {
                required: true,
                whitespace: true,
                message: sysText(
                  intl,
                  'pages.sys.role.dataScopeRequired',
                  '请选择数据权限',
                ),
              },
            ]}
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
                fieldNames={{
                  label: 'name',
                  value: 'id',
                  children: 'children',
                }}
                treeCheckable
                allowClear
                multiple
                disabled={disabled}
              />
            </Form.Item>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default RoleAOEForm;
