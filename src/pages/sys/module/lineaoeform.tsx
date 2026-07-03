import { Form, Input, Modal } from 'antd';
import React, { useEffect } from 'react';
import { DictSelector } from '@/components';
import type { ModuleResource } from './data.d';

export type LineModalType = '' | 'create' | 'edit';

export interface ModuleLineAOEFormProps {
  modalType: LineModalType;
  setModalType: (v: LineModalType) => void;
  lines: ModuleResource[];
  setLines: (lines: ModuleResource[]) => void;
  editIndex: number | '';
  setEditIndex: (v: number | '') => void;
  resourceTypeDict?: Record<string, string>;
}

const TITLE: Record<Exclude<LineModalType, ''>, string> = {
  create: '新增',
  edit: '编辑',
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
}) => {
  const [form] = Form.useForm<ModuleResource>();

  useEffect(() => {
    if (modalType === '') return;
    form.resetFields();
    if (editIndex !== '' && lines[editIndex]) {
      form.setFieldsValue(lines[editIndex]);
      return;
    }
    form.setFieldsValue({ resourceType: 'GET' } as ModuleResource);
  }, [modalType, editIndex, lines, form]);

  const handleSaveClick = async () => {
    const values = await form.validateFields();
    const exist = lines.find(
      (v, i) => values.resourceUrl === v.resourceUrl && i !== editIndex,
    );
    if (exist) {
      Modal.warning({ title: '路径重复', content: '资源路径已经存在' });
      return;
    }
    const next = [...lines];
    if (editIndex !== '') {
      Object.assign(next[editIndex], values);
    } else {
      next.push(values);
    }
    setModalType('');
    setEditIndex('');
    setLines(next);
  };

  return (
    <Modal
      maskClosable={false}
      cancelText="取消"
      okText="提交"
      centered
      onCancel={() => setModalType('')}
      open={modalType !== ''}
      width={500}
      onOk={handleSaveClick}
      title={`${TITLE[modalType as 'create' | 'edit'] ?? '查看'}资源`}
    >
      <Form colon layout="horizontal" form={form} {...formItemLayout}>
        <Form.Item
          label="资源描述"
          name="resourceDesc"
          rules={[{ required: true, max: 30 }]}
        >
          <Input />
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
              message: '路径格式错误，必须以 / 开头，仅允许使用字母、数字或 *',
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModuleLineAOEForm;
