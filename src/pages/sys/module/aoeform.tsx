import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Skeleton,
  Switch,
  Table,
  Tooltip,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import IconMap from '@/appicon';
import { IconSelect, TreeSelector } from '@/components';
import useFormDialogStyles from '@/components/FormDialog/useStyles';
import RecordAuditFields from '@/components/RecordAuditFields';
import {
  excludeTreeSubtree,
  findTreeNode,
  isTreeParentAllowed,
} from '@/utils/treeOperations';
import useLeaveGuard from '../account/useLeaveGuard';
import type { ModuleItem, ModuleResource } from './data.d';
import ModuleLineList from './linelist';
import { checkModuleUnique, editModule } from './service';

export type OperateType = '' | 'create' | 'edit' | 'view';

export interface ModuleAOEFormProps {
  operateType: OperateType;
  currentItem: Partial<ModuleItem>;
  data: ModuleItem[];
  onClose: () => void;
  onSuccess: () => void;
  detailsLoading?: boolean;
  detailsError?: string;
}

const TITLE: Record<Exclude<OperateType, ''>, string> = {
  create: '新增',
  edit: '编辑',
  view: '查看',
};

const formItemLayout = {
  labelCol: { flex: '0 0 100px' },
  wrapperCol: { flex: 'auto' },
};
const remarkStyle: React.CSSProperties & { '--eva-view-rows': number } = {
  '--eva-view-rows': 2,
};

const ModuleAOEForm: React.FC<ModuleAOEFormProps> = ({
  operateType,
  currentItem,
  data,
  onClose,
  onSuccess,
  detailsLoading = false,
  detailsError,
}) => {
  const [form] = Form.useForm<
    Omit<ModuleItem, 'status'> & { status?: boolean }
  >();
  const dialogStyles = useFormDialogStyles();
  const { message: msg, modal } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const savingRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [lineDialogOpen, setLineDialogOpen] = useState(false);
  const isView = operateType === 'view';
  const renderValue = (value: React.ReactNode, multiline = false) => (
    <div
      className={`eva-view-value${multiline ? ' eva-view-value-multiline' : ''}`}
      style={multiline ? remarkStyle : undefined}
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
  const disabled =
    isView || submitting || detailsLoading || Boolean(detailsError);
  const leaveGuard = useLeaveGuard({
    identity: `${operateType}:${currentItem.id ?? ''}`,
    dirty: !isView && dirty,
    busy: !isView && submitting,
    isBusy: () => savingRef.current || lineDialogOpen,
    onClose,
    onClean: () => setDirty(false),
    onBlocked: () => msg.info('请先关闭资源窗口'),
    modal,
  });
  const [lines, setLines] = useState<ModuleResource[]>(
    currentItem?.resources ?? [],
  );
  const parentOptions = useMemo(
    () => (isView ? data : excludeTreeSubtree(data, currentItem.id)),
    [data, currentItem.id, isView],
  );
  const fixedParent = operateType === 'create' && Boolean(currentItem.parentId);

  useEffect(() => {
    if (operateType === '') return;
    setLines(currentItem?.resources ?? []);
    setDirty(false);
    savingRef.current = false;
    setSubmitting(false);
    if (isView || detailsLoading || detailsError) return;
    form.resetFields();
    form.setFieldsValue({
      ...(currentItem as ModuleItem),
      // V5: status 字段为 boolean 形式（true=启用），保存时再映射回 0000/0001
      status: currentItem?.status ? currentItem.status === '0000' : true,
    });
  }, [operateType, currentItem, form, isView, detailsLoading, detailsError]);

  const checkCode = async (_: unknown, value: string) => {
    if (isView || detailsLoading || detailsError) return;
    const parentId = form.getFieldValue('parentId');
    const res = await checkModuleUnique(value, parentId, currentItem?.id);
    if (!res.success) throw new Error(res.message ?? '模块编码已存在');
  };

  const handleSaveClick = async () => {
    if (
      (operateType !== 'create' && operateType !== 'edit') ||
      disabled ||
      savingRef.current ||
      lineDialogOpen
    )
      return;
    savingRef.current = true;
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      if (!leaveGuard.isCurrent()) return;
      if (fixedParent && values.parentId !== currentItem.parentId) {
        msg.error('新增下级时不能修改上级模块');
        return;
      }
      if (!isTreeParentAllowed(data, currentItem.id, values.parentId)) {
        msg.error('不能选择当前模块或其下级作为上级模块');
        return;
      }
      const res = await editModule({
        name: values.name,
        code: values.code,
        routeUrl: values.routeUrl,
        icon: values.icon,
        parentId: values.parentId,
        orders: values.orders,
        remark: values.remark,
        id: currentItem.id,
        status: values.status ? '0000' : '0001',
        resources: lines.map(
          ({
            id,
            mainId,
            code,
            sort,
            resourceDesc,
            resourceUrl,
            resourceType,
          }) => ({
            id,
            mainId,
            code,
            sort,
            resourceDesc,
            resourceUrl,
            resourceType,
          }),
        ),
      });
      if (!leaveGuard.isCurrent()) return;
      if (res.success) {
        leaveGuard.release();
        msg.success(`${TITLE[operateType as 'create' | 'edit']}成功`);
        onClose();
        onSuccess();
      } else {
        msg.error('保存失败，请重试');
      }
    } catch (error) {
      if (
        leaveGuard.isCurrent() &&
        !(error && typeof error === 'object' && 'errorFields' in error)
      )
        msg.error('保存失败，请重试');
    } finally {
      if (leaveGuard.isCurrent()) {
        savingRef.current = false;
        setSubmitting(false);
      }
    }
  };

  return (
    <Drawer
      closable={{ placement: 'end', disabled: submitting || lineDialogOpen }}
      keyboard={!submitting && !lineDialogOpen}
      styles={dialogStyles}
      width={640}
      mask={{ closable: false }}
      onClose={isView ? onClose : leaveGuard.requestClose}
      open={operateType !== ''}
      title={`${TITLE[operateType as Exclude<OperateType, ''>] ?? '查看'}模块信息`}
      destroyOnHidden
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button
            disabled={submitting || lineDialogOpen}
            onClick={isView ? onClose : leaveGuard.requestClose}
            style={{ marginRight: 8 }}
          >
            {isView ? '关闭' : '取消'}
          </Button>
          {!isView && (
            <Button
              disabled={disabled || lineDialogOpen}
              onClick={handleSaveClick}
              type="primary"
              loading={submitting}
            >
              保存
            </Button>
          )}
        </div>
      }
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
            <Col xs={24} sm={12}>
              <Form.Item label="模块名称">
                {renderValue(currentItem.name?.trim() || '—')}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="模块编码">
                {renderValue(currentItem.code?.trim() || '—')}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="路由地址">
            {renderValue(currentItem.routeUrl?.trim() || '—')}
          </Form.Item>
          <Form.Item label="模块图标">
            {renderValue(
              currentItem.icon ? (
                <>
                  {IconMap[currentItem.icon] ?? null} {currentItem.icon}
                </>
              ) : (
                '—'
              ),
            )}
          </Form.Item>
          <Form.Item label="上级模块">
            {renderValue(
              currentItem.parentName?.trim() ||
                findTreeNode(data, currentItem.parentId)?.name ||
                '—',
            )}
          </Form.Item>
          <Row>
            <Col span={12}>
              <Form.Item label="显示顺序">
                {renderValue(currentItem.orders ?? '—')}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="是否启用">
                {renderValue(
                  currentItem.status === '0000'
                    ? '启用'
                    : currentItem.status === '0001'
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
            <Col xs={24} sm={12}>
              <Form.Item
                label="模块名称"
                name="name"
                rules={[{ required: true, max: 30, min: 2 }]}
              >
                <Input maxLength={30} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="模块编码"
                name="code"
                validateTrigger="onBlur"
                rules={[
                  {
                    max: 40,
                    min: 2,
                    required: true,
                    whitespace: true,
                    validator: checkCode,
                    message: '编码格式错误，仅允许使用字母、数字或下划线',
                    pattern: /^[a-zA-Z_0-9]{2,40}$/,
                  },
                ]}
              >
                <Input maxLength={40} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="路由地址"
            name="routeUrl"
            rules={[
              {
                max: 40,
                min: 5,
                required: true,
                whitespace: true,
                message:
                  '路由地址格式错误，必须以 / 开头，仅允许使用字母或数字',
                pattern: /^\/[a-zA-Z_]*[/a-zA-Z_0-9]{2,40}$/,
              },
            ]}
          >
            <Input maxLength={40} />
          </Form.Item>
          <Form.Item label="模块图标" name="icon" rules={[{ required: true }]}>
            <IconSelect disabled={disabled} />
          </Form.Item>
          <Form.Item
            label={
              <span>
                上级模块&nbsp;
                <Tooltip title="留空为添加顶级模块">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            name="parentId"
          >
            <TreeSelector
              disabled={disabled || fixedParent}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              data={parentOptions as never}
              keys={['id', 'name', 'children']}
              allowClear={!fixedParent}
              showSearch
              placeholder="请选择上级模块（留空为添加顶级模块）"
            />
          </Form.Item>
          <Row>
            <Col span={12}>
              <Form.Item
                label="显示顺序"
                name="orders"
                rules={[
                  {
                    required: true,
                    type: 'number',
                    message: '请输入有效的显示顺序',
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="是否启用" valuePropName="checked" name="status">
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注" name="remark" rules={[{ max: 200 }]}>
            <Input.TextArea maxLength={200} />
          </Form.Item>
        </Form>
      )}

      {detailsLoading || detailsError ? (
        <section
          aria-label="资源信息"
          aria-busy={detailsLoading && !detailsError}
        >
          <Divider>资源信息</Divider>
          {!isView && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: 10,
              }}
            >
              <Skeleton.Button active={detailsLoading && !detailsError} />
            </div>
          )}
          <Table
            rowKey="id"
            size="small"
            columns={[
              { title: '资源描述', width: 220 },
              { title: '资源路径', width: 300 },
              { title: '资源类型', width: 140, align: 'center' },
              { title: '操作', width: 220, align: 'center' },
            ]}
            dataSource={[]}
            pagination={false}
            scroll={{ x: 880 }}
            locale={{
              emptyText: (
                <Skeleton.Node
                  active={detailsLoading && !detailsError}
                  styles={{
                    root: { width: '100%' },
                    content: {
                      width: '100%',
                      height: 'var(--ant-control-height, 32px)',
                    },
                  }}
                />
              ),
            }}
          />
        </section>
      ) : (
        <ModuleLineList
          key={`${operateType}:${currentItem.id ?? ''}`}
          lines={lines}
          readOnly={disabled}
          onDialogOpenChange={setLineDialogOpen}
          setLines={(next) => {
            if (disabled || !leaveGuard.isCurrent()) return;
            setLines(next);
            setDirty(true);
          }}
        />
      )}
    </Drawer>
  );
};

export default ModuleAOEForm;
