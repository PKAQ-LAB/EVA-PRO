import { QuestionCircleOutlined } from '@ant-design/icons';
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
  Tooltip,
  TreeSelect,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import APIS from '@/apis';
import useFormDialogStyles from '@/components/FormDialog/useStyles';
import RecordAuditFields from '@/components/RecordAuditFields';
import type { CanRequest } from '@/utils/resourcePermission';
import {
  excludeTreeSubtree,
  findTreeNode,
  isTreeParentAllowed,
} from '@/utils/treeOperations';
import useLeaveGuard from '../account/useLeaveGuard';
import type { OrgItem } from './data.d';
import { checkOrgUnique, editOrg } from './service';

export type OperateType = '' | 'create' | 'edit' | 'view';

export interface OrgAOEFormProps {
  canRequest: CanRequest;
  operateType: OperateType;
  currentItem: Partial<OrgItem>;
  data: OrgItem[];
  onClose: () => void;
  onSuccess: () => void;
  detailsLoading?: boolean;
  detailsError?: string;
}

const formItemLayout = {
  labelCol: { flex: '0 0 100px' },
  wrapperCol: { flex: 'auto' },
};

const TITLE: Record<Exclude<OperateType, ''>, string> = {
  create: '新增',
  edit: '编辑',
  view: '查看',
};

const OrgAOEForm: React.FC<OrgAOEFormProps> = ({
  canRequest,
  operateType,
  currentItem,
  data,
  onClose,
  onSuccess,
  detailsLoading = false,
  detailsError,
}) => {
  const [form] = Form.useForm<OrgItem & { enable?: boolean }>();
  const dialogStyles = useFormDialogStyles();
  const { message: msg, modal } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const savingRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const isView = operateType === 'view';
  const permissionRef = useRef(canRequest);
  permissionRef.current = canRequest;
  const contextRef = useRef({
    operateType,
    currentItem,
    detailsLoading,
    detailsError,
  });
  contextRef.current = {
    operateType,
    currentItem,
    detailsLoading,
    detailsError,
  };
  const canSave = () => {
    const current = contextRef.current;
    return (
      (current.operateType === 'create' || current.operateType === 'edit') &&
      !current.detailsLoading &&
      !current.detailsError &&
      current.currentItem.frozen !== 9999 &&
      current.currentItem.status !== '9999' &&
      (current.operateType !== 'edit' ||
        permissionRef.current(
          'GET',
          `${APIS.ORG_GET}/${current.currentItem.id}`,
        )) &&
      permissionRef.current('POST', APIS.ORG_EDIT) &&
      permissionRef.current('POST', APIS.ORG_CHECKUNIQUE)
    );
  };
  const renderValue = (value: React.ReactNode, multiline = false) => (
    <div
      className={`eva-view-value${multiline ? ' eva-view-value-multiline' : ''}`}
      aria-busy={detailsLoading && !detailsError}
    >
      {detailsLoading || detailsError ? (
        <Skeleton.Node
          active={detailsLoading && !detailsError}
          styles={{
            root: { width: '100%' },
            content: {
              width: '100%',
              height: multiline
                ? 'calc(var(--ant-font-height, 22px) * 4)'
                : 'var(--ant-font-height, 22px)',
            },
          }}
        />
      ) : (
        value
      )}
    </div>
  );
  const disabled =
    !canSave() ||
    isView ||
    submitting ||
    detailsLoading ||
    Boolean(detailsError) ||
    currentItem.frozen === 9999 ||
    currentItem.status === '9999';
  const leaveGuard = useLeaveGuard({
    identity: `${operateType}:${currentItem.id ?? ''}`,
    dirty: !isView && dirty,
    busy: !isView && submitting,
    isBusy: () => savingRef.current,
    onClose,
    onClean: () => setDirty(false),
    onBlocked: () => msg.info('加载中...'),
    modal,
  });
  const parentOptions = useMemo(
    () => (isView ? data : excludeTreeSubtree(data, currentItem.id)),
    [data, currentItem.id, isView],
  );

  useEffect(() => {
    if (operateType === '' || isView || detailsLoading || detailsError) return;
    form.resetFields();
    setDirty(false);
    savingRef.current = false;
    setSubmitting(false);
    form.setFieldsValue({
      ...(currentItem as OrgItem),
      enable: currentItem.status ? currentItem.status === '0001' : true,
    });
  }, [operateType, currentItem, form, isView, detailsLoading, detailsError]);

  const checkCode = async (_: unknown, value: string) => {
    if (isView || detailsLoading || detailsError) return;
    if (!canSave()) throw new Error('无权限保存或校验部门编码');
    const parentId = form.getFieldValue('parentId');
    if (
      currentItem?.id &&
      value === currentItem.code &&
      String(parentId ?? '') === String(currentItem.parentId ?? '')
    ) {
      return;
    }
    const res = await checkOrgUnique(value, parentId, currentItem.id).catch(
      (error: unknown) => {
        const failure = error as
          | { name?: string; message?: string; response?: { status?: number } }
          | undefined;
        const status = failure?.response?.status;
        if (status === 403) throw new Error('无权限校验部门编码');
        if (status === 401) throw new Error('登录已失效，请重新登录后校验');
        if (status && status >= 500)
          throw new Error('编码校验服务异常，请稍后重试');
        if (failure?.name === 'BizError' && failure.message)
          throw new Error(failure.message);
        throw new Error('编码校验失败，请检查网络或稍后重试');
      },
    );
    if (!canSave()) throw new Error('部门操作权限已变更，请重新确认');
    if (!res?.success)
      throw new Error(res?.message ?? '编码校验未通过，请稍后重试');
  };

  const handleSaveClick = async () => {
    if (
      (operateType !== 'create' && operateType !== 'edit') ||
      disabled ||
      !canSave() ||
      savingRef.current
    )
      return;
    savingRef.current = true;
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      if (!leaveGuard.isCurrent() || !canSave()) return;
      if (!isTreeParentAllowed(data, currentItem.id, values.parentId)) {
        msg.error('不能选择当前部门或其下级作为上级部门');
        return;
      }
      const res = await editOrg({
        name: values.name,
        code: values.code,
        parentId: values.parentId,
        orders: values.orders,
        remark: values.remark,
        id: currentItem.id,
        status: values.enable ? '0001' : '0000',
      });
      if (!leaveGuard.isCurrent()) return;
      if (res.success) {
        leaveGuard.release();
        msg.success(`${TITLE[operateType as 'create' | 'edit']}成功`);
        onClose();
        onSuccess();
      } else {
        msg.error('保存失败，请稍后重试');
      }
    } catch (error) {
      if (!leaveGuard.isCurrent()) return;
      // 字段错误由表单展示；请求失败时保留输入，避免未处理的 Promise 拒绝。
      if (!(error && typeof error === 'object' && 'errorFields' in error)) {
        msg.error('保存失败，请稍后重试');
      }
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
      onCancel={isView ? onClose : leaveGuard.requestClose}
      open={operateType !== ''}
      width={700}
      centered
      onOk={handleSaveClick}
      footer={isView ? <Button onClick={onClose}>关闭</Button> : undefined}
      okButtonProps={{ disabled }}
      cancelButtonProps={{ disabled: submitting }}
      title={`${TITLE[operateType as Exclude<OperateType, ''>] ?? '查看'}部门信息`}
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
          labelAlign="left"
          layout="horizontal"
          {...formItemLayout}
          aria-busy={detailsLoading && !detailsError}
        >
          {detailsLoading && !detailsError && (
            <span role="status" aria-label="加载中..." />
          )}
          <Form.Item label="部门名称">
            {renderValue(currentItem.name?.trim() || '—')}
          </Form.Item>
          <Form.Item label="部门编码">
            {renderValue(currentItem.code?.trim() || '—')}
          </Form.Item>
          <Form.Item label="上级部门">
            {renderValue(
              currentItem.parentName?.trim() ||
                findTreeNode(data, currentItem.parentId)?.name ||
                '—',
            )}
          </Form.Item>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="显示顺序">
                {renderValue(currentItem.orders ?? '—')}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="是否启用">
                {renderValue(
                  currentItem.status === '0001'
                    ? '启用'
                    : currentItem.status === '0000'
                      ? '停用'
                      : currentItem.status === '9999'
                        ? '只读'
                        : '—',
                )}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注">
            {renderValue(currentItem.remark?.trim() || '—', true)}
          </Form.Item>
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
          labelAlign="left"
          layout="horizontal"
          disabled={disabled}
          onValuesChange={() => {
            if (!disabled) setDirty(true);
          }}
          onSubmitCapture={(event) => {
            if (isView) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          {...formItemLayout}
        >
          <Form.Item name="name" label="部门名称" rules={[{ required: true }]}>
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item
            name="code"
            label="部门编码"
            validateTrigger="onBlur"
            hasFeedback
            validateFirst
            rules={[
              {
                message: '编码格式错误，请输入2-40位字母、数字或下划线',
                pattern: /^[a-zA-Z_0-9]{2,40}$/,
                required: true,
                whitespace: true,
              },
              { validator: checkCode },
            ]}
          >
            <Input maxLength={40} />
          </Form.Item>
          <Form.Item
            name="parentId"
            label={
              <span>
                上级部门&nbsp;
                <Tooltip title="留空为添加顶级部门">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
          >
            <TreeSelect
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={parentOptions as never}
              fieldNames={{ label: 'name', value: 'id', children: 'children' }}
              treeNodeFilterProp="name"
              treeDefaultExpandAll
              allowClear
              showSearch
              placeholder="请选择上级部门（留空为添加顶级部门）"
            />
          </Form.Item>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="显示顺序" name="orders">
                <Input maxLength={5} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="是否启用" name="enable" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注" name="remark">
            <Input.TextArea maxLength={200} rows={4} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default OrgAOEForm;
