import { App, Button, Form, Input, Modal } from 'antd';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import DictSelector from '@/components/DictSelector';
import useFormDialogStyles from '@/components/FormDialog/useStyles';
import type { ModuleResource } from './data.d';

export type LineModalType = '' | 'create' | 'edit' | 'view';

export interface ModuleLineAOEFormProps {
  modalType: LineModalType;
  setModalType: (v: LineModalType) => void;
  lines: ModuleResource[];
  setLines: (lines: ModuleResource[]) => void;
  editIndex: number | '';
  setEditIndex: (v: number | '') => void;
  resourceTypeDict?: Record<string, string>;
  viewRecord?: ModuleResource;
  readOnly?: boolean;
}

const TITLE: Record<Exclude<LineModalType, ''>, string> = {
  create: '新增',
  edit: '编辑',
  view: '查看',
};

const formItemLayout = {
  labelCol: { flex: '0 0 100px' },
  wrapperCol: { flex: 'auto' },
};

const ModuleLineAOEForm: React.FC<ModuleLineAOEFormProps> = ({
  modalType,
  setModalType,
  lines,
  setLines,
  editIndex,
  setEditIndex,
  resourceTypeDict,
  viewRecord,
  readOnly = false,
}) => {
  const [form] = Form.useForm<ModuleResource>();
  const { modal } = App.useApp();
  const dialogStyles = useFormDialogStyles();
  const isView = modalType === 'view';
  const disabled = isView || readOnly;
  const session = useRef(0);
  useLayoutEffect(() => {
    session.current += 1;
    return () => {
      session.current += 1;
    };
  }, [modalType, editIndex, readOnly]);

  useEffect(() => {
    if (modalType === '' || isView) return;
    form.resetFields();
    if (editIndex !== '' && lines[editIndex]) {
      form.setFieldsValue(lines[editIndex]);
      return;
    }
    form.setFieldsValue({ resourceType: 'GET' });
  }, [modalType, editIndex, lines, form, isView, viewRecord]);

  const handleSaveClick = async () => {
    if (disabled || (modalType !== 'create' && modalType !== 'edit')) return;
    const request = session.current;
    const values = await form.validateFields().catch(() => undefined);
    if (!values || request !== session.current) return;
    const exist = lines.find(
      (value, index) =>
        index !== editIndex &&
        Boolean(
          values.resourceUrl &&
            values.resourceUrl === value.resourceUrl &&
            values.resourceType === value.resourceType,
        ),
    );
    if (exist) {
      modal.warning({
        title: '资源重复',
        content: '同类型资源路径已经存在',
      });
      return;
    }
    const next = [...lines];
    if (editIndex !== '') {
      next[editIndex] = {
        ...next[editIndex],
        resourceDesc: values.resourceDesc,
        resourceType: values.resourceType,
        resourceUrl: values.resourceUrl,
      };
    } else {
      next.push({
        resourceDesc: values.resourceDesc,
        resourceType: values.resourceType,
        resourceUrl: values.resourceUrl,
      });
    }
    setModalType('');
    setEditIndex('');
    setLines(next);
  };

  return (
    <Modal
      styles={dialogStyles}
      mask={{ closable: false }}
      cancelText="取消"
      okText="提交"
      centered
      onCancel={() => setModalType('')}
      open={modalType !== ''}
      width={500}
      onOk={handleSaveClick}
      footer={
        isView ? (
          <Button onClick={() => setModalType('')}>关闭</Button>
        ) : undefined
      }
      okButtonProps={{ disabled }}
      title={`${TITLE[modalType as Exclude<LineModalType, ''>] ?? '查看'}资源`}
    >
      {isView ? (
        <Form
          key="view"
          component="div"
          colon
          layout="horizontal"
          {...formItemLayout}
        >
          <Form.Item label="资源描述">
            <span className="eva-view-value">
              {viewRecord?.resourceDesc?.trim() || '—'}
            </span>
          </Form.Item>
          <Form.Item label="资源类型">
            <span className="eva-view-value">
              {resourceTypeDict?.[viewRecord?.resourceType ?? ''] ||
                viewRecord?.resourceType ||
                '—'}
            </span>
          </Form.Item>
          <Form.Item label="资源路径">
            <span className="eva-view-value">
              {viewRecord?.resourceUrl?.trim() || '—'}
            </span>
          </Form.Item>
        </Form>
      ) : (
        <Form
          key="write"
          colon
          disabled={disabled}
          layout="horizontal"
          form={form}
          {...formItemLayout}
          onSubmitCapture={(event) => {
            if (disabled) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          <Form.Item
            label="资源描述"
            name="resourceDesc"
            rules={[{ required: true, max: 30 }]}
          >
            <Input placeholder="例如：新增、查询、修改、删除" />
          </Form.Item>
          <Form.Item
            label="资源类型"
            name="resourceType"
            rules={[{ required: true }]}
          >
            <DictSelector
              code="RESOURCE_TYPE"
              data={resourceTypeDict}
              showall={false}
              disabled={disabled}
            />
          </Form.Item>
          <Form.Item
            label="资源路径"
            name="resourceUrl"
            rules={[
              {
                required: true,
                max: 300,
                whitespace: true,
                pattern: /^\/[a-zA-Z_]*[/a-zA-Z_0-9*]{1,300}$/,
                message:
                  '路径格式错误，必须以 / 开头，仅允许使用字母、数字或 *',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ModuleLineAOEForm;
