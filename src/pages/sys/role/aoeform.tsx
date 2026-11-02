import { useIntl, useModel } from '@umijs/max';
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
} from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DictSelector } from '@/components';
import useFormDialogStyles from '@/components/FormDialog/useStyles';
import RecordAuditFields from '@/components/RecordAuditFields';
import useMenuAccess from '@/utils/useMenuAccess';
import useLeaveGuard from '../account/useLeaveGuard';
import { frozenText, sysText } from '../status';
import RoleDepartments from './component/roledepartments';
import RolePosts from './component/roleposts';
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
  const canAction = useMenuAccess('/sys/role');
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const dataPermissionEnabled =
    initialState?.currentUser?.dataPermissionEnabled;
  const latestCapability = useRef(dataPermissionEnabled);
  latestCapability.current = dataPermissionEnabled;
  const dialogStyles = useFormDialogStyles();
  const [form] = Form.useForm<RoleItem>();
  const { message: msg, modal } = App.useApp();

  const [submitting, setSubmitting] = useState(false);
  const savingRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const isView = modalType === 'view';
  const scopeVisible = isView
    ? canAction('read')
    : dataPermissionEnabled === true &&
      canAction(modalType === 'create' ? 'create' : 'update');
  const capabilityUnknown =
    !isView && typeof dataPermissionEnabled !== 'boolean';
  const readOnly = isSystemRole(currentItem);
  const disabled =
    isView ||
    readOnly ||
    !canAction(modalType === 'create' ? 'create' : 'update') ||
    submitting ||
    detailsLoading ||
    Boolean(detailsError);
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
  const scope = Object.hasOwn(currentItem, 'dataScope')
    ? currentItem.dataScope
    : currentItem.dataPermissionType;
  const watchedScope = Form.useWatch('dataScope', { form, preserve: true });
  const watchedPosts = Form.useWatch('dataPostIds', { form, preserve: true });
  const effectiveScope = isView ? scope : (watchedScope ?? scope);
  const postsVisible =
    scopeVisible && modalType !== '' && effectiveScope === '0006';
  const deptsVisible =
    scopeVisible && modalType !== '' && effectiveScope === '0003';
  const scopePending = scopeVisible && detailsLoading;
  const watchedOrgs = Form.useWatch('dataOrgIds', { form, preserve: true });
  const [deptsReady, setDeptsReady] = useState(false);
  const deptsReadyRef = useRef(false);
  const onDeptsReadyChange = useCallback((ready: boolean) => {
    deptsReadyRef.current = ready;
    setDeptsReady(ready);
  }, []);
  const postIds: string[] = isView
    ? (currentItem.dataPostIds ?? [])
    : (watchedPosts ?? currentItem.dataPostIds ?? []);
  const [postsValid, setPostsValid] = useState(false);
  const postsValidRef = useRef(false);
  const onPostsValidChange = useCallback((valid: boolean) => {
    postsValidRef.current = valid;
    setPostsValid(valid);
  }, []);
  const selectedOrgs = Object.hasOwn(currentItem, 'dataOrgIds')
    ? currentItem.dataOrgIds
    : currentItem.dataPermissionDeptid;
  const currentOrgs = isView ? selectedOrgs : (watchedOrgs ?? selectedOrgs);
  const orgIds: string[] = Array.isArray(currentOrgs)
    ? currentOrgs
    : (currentOrgs?.split(',').filter(Boolean) ?? []);
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

  // 初始化 / 切换 currentItem
  useEffect(() => {
    if (modalType === '') return;
    if (!isView && !detailsLoading && !detailsError) form.resetFields();
    setDirty(false);
    savingRef.current = false;
    setSubmitting(false);
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

  const handleDataPermissionChange = (v: string) => {
    if (disabled || !leaveGuard.isCurrent()) return;
    if (v !== '0006') form.setFieldValue('dataPostIds', []);
  };

  const handleSaveClick = async () => {
    if (!canAction(modalType === 'create' ? 'create' : 'update')) return;
    if (capabilityUnknown) {
      msg.warning('数据权限能力尚未获取，请刷新页面后重试');
      return;
    }
    if (
      (modalType !== 'create' && modalType !== 'edit') ||
      disabled ||
      savingRef.current ||
      (postsVisible && !postsValidRef.current) ||
      (deptsVisible && !deptsReadyRef.current)
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
      if (
        !values ||
        !leaveGuard.isCurrent() ||
        !canAction(modalType === 'create' ? 'create' : 'update')
      )
        return;
      // 异步校验期间能力变化时，不让旧提交沿捕获的开关继续保存。
      if (latestCapability.current !== dataPermissionEnabled) return;
      if (dataPermissionEnabled === true) {
        if (values.dataScope === '0006' && !postsValidRef.current) return;
        if (values.dataScope === '0003' && !deptsReadyRef.current) return;
      }
      // 隐藏部门控件时，validateFields不会返回该字段，仍须保留详情中的组织关联。
      const dataOrgIds: RoleItem['dataOrgIds'] =
        form.getFieldValue('dataOrgIds');
      const formData: Partial<RoleItem> = {
        name: values.name,
        code: values.code,
        remark: values.remark,
        frozen: modalType === 'edit' ? currentItem.frozen : values.frozen,
        id: currentItem.id,
        ...(dataPermissionEnabled === true
          ? {
              dataScope: values.dataScope,
              dataPostIds:
                values.dataScope === '0006'
                  ? form.getFieldValue('dataPostIds')
                  : [],
              dataOrgIds:
                values.dataScope === '0006'
                  ? ''
                  : Array.isArray(dataOrgIds)
                    ? dataOrgIds.join(',')
                    : dataOrgIds,
            }
          : {}),
      };
      const res = await saveRole(formData, dataPermissionEnabled);
      if (
        !leaveGuard.isCurrent() ||
        !canAction(modalType === 'create' ? 'create' : 'update')
      )
        return;
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
      open={modalType !== '' && (!isView || canAction('read'))}
      width={postsVisible || deptsVisible ? 1060 : 700}
      centered
      onOk={handleSaveClick}
      footer={
        isView ? (
          <Button onClick={() => setModalType('')}>关闭</Button>
        ) : undefined
      }
      cancelButtonProps={{ disabled: submitting }}
      okButtonProps={{
        disabled:
          !canAction(modalType === 'create' ? 'create' : 'update') ||
          disabled ||
          capabilityUnknown ||
          (postsVisible && !postsValid) ||
          (deptsVisible && !deptsReady),
        style:
          readOnly || !canAction(modalType === 'create' ? 'create' : 'update')
            ? { display: 'none' }
            : undefined,
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
      {capabilityUnknown && (
        <Alert
          className="eva-view-notice"
          type="warning"
          title="数据权限能力尚未获取，请刷新页面后重试"
        />
      )}
      {detailsError && (
        <Alert
          className="eva-view-notice"
          type="error"
          showIcon
          title={detailsError}
        />
      )}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 580px', minWidth: 0 }}>
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
              <Form.Item
                label={sysText(intl, 'pages.sys.role.remark', '角色描述')}
              >
                {renderValue(currentItem.remark?.trim() || '—', true)}
              </Form.Item>
              {scopeVisible && (
                <Form.Item
                  label={sysText(intl, 'pages.sys.role.dataScope', '数据权限')}
                >
                  {renderValue(scope?.trim() || '—')}
                </Form.Item>
              )}
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
                >
                  {renderValue(
                    currentItem.frozen == null
                      ? '—'
                      : frozenText(intl, currentItem.frozen),
                  )}
                </Form.Item>
              )}
              <Form.Item
                label={sysText(intl, 'pages.sys.role.remark', '角色描述')}
                name="remark"
              >
                <Input.TextArea maxLength={60} disabled={disabled} />
              </Form.Item>
              {scopeVisible && (
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
              )}
            </Form>
          )}
        </div>
        <div
          data-role-department-region
          aria-hidden={!deptsVisible && !scopePending ? true : undefined}
          style={{
            flex: '1 1 300px',
            minWidth: 0,
            minHeight:
              'calc(var(--ant-control-height, 32px) + var(--ant-margin-lg, 24px))',
            display: deptsVisible || scopePending ? undefined : 'none',
          }}
        >
          {deptsVisible ? (
            <RoleDepartments
              key={`${modalType}:${currentItem.id ?? ''}`}
              identity={`${modalType}:${currentItem.id ?? ''}`}
              value={orgIds}
              readOnly={isView || readOnly}
              disabled={disabled}
              waiting={detailsLoading || Boolean(detailsError)}
              onReadyChange={onDeptsReadyChange}
              onChange={(ids) => {
                if (!disabled) {
                  form.setFieldValue('dataOrgIds', ids);
                  setDirty(true);
                }
              }}
            />
          ) : scopePending ? (
            <Skeleton.Node
              active
              styles={{
                root: { width: '100%' },
                content: { width: '100%', height: 22 },
              }}
            />
          ) : null}
        </div>
        {postsVisible && (
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <RolePosts
              key={`${modalType}:${currentItem.id ?? ''}`}
              identity={`${modalType}:${currentItem.id ?? ''}`}
              value={postIds}
              readOnly={isView || readOnly}
              disabled={disabled}
              waiting={detailsLoading || Boolean(detailsError)}
              onValidChange={onPostsValidChange}
              onChange={(ids) => {
                if (!disabled) {
                  form.setFieldValue('dataPostIds', ids);
                  setDirty(true);
                }
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RoleAOEForm;
