import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Switch,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { IconSelect, TreeSelector } from '@/components';
import type { ModuleItem, ModuleResource } from './data.d';
import ModuleLineList from './linelist';
import { checkModuleUnique, editModule } from './service';

export type OperateType = '' | 'create' | 'edit';

export interface ModuleAOEFormProps {
  operateType: OperateType;
  currentItem: Partial<ModuleItem>;
  data: ModuleItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const TITLE: Record<Exclude<OperateType, ''>, string> = {
  create: '新增',
  edit: '编辑',
};

const formItemLayout = {
  labelCol: { flex: '0 0 100px' },
  wrapperCol: { flex: 'auto' },
};

const ModuleAOEForm: React.FC<ModuleAOEFormProps> = ({
  operateType,
  currentItem,
  data,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<ModuleItem & { status?: boolean }>();
  const { message: msg } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [lines, setLines] = useState<ModuleResource[]>(
    currentItem?.resources ?? [],
  );

  useEffect(() => {
    if (operateType === '') return;
    setLines(currentItem?.resources ?? []);
    form.resetFields();
    form.setFieldsValue({
      ...(currentItem as ModuleItem),
      // V5: status 字段为 boolean 形式（true=启用），保存时再映射回 0000/0001
      status: currentItem?.status ? currentItem.status === '0000' : true,
    } as never);
  }, [operateType, currentItem, form]);

  const checkPath = async (_: unknown, value: string) => {
    const parentId = form.getFieldValue('parentId');
    const res = await checkModuleUnique(value, parentId, currentItem?.id);
    if (!res.success) throw new Error(res.message ?? '路径已存在');
  };

  const handleSaveClick = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const res = await editModule({
        ...(values as ModuleItem),
        id: currentItem.id,
        status: (values as { status?: boolean }).status ? '0000' : '0001',
        resources: lines,
      });
      if (res.success) {
        msg.success(`${TITLE[operateType as 'create' | 'edit']}成功`);
        onClose();
        onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      width={640}
      maskClosable={false}
      onClose={onClose}
      open={operateType !== ''}
      title={`${TITLE[operateType as 'create' | 'edit'] ?? '查看'}模块信息`}
      destroyOnHidden
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button onClick={handleSaveClick} type="primary" loading={submitting}>
            保存
          </Button>
        </div>
      }
    >
      <Form colon form={form} layout="horizontal" {...formItemLayout}>
        <Form.Item
          label="模块名称"
          name="name"
          rules={[{ required: true, max: 30, min: 2 }]}
        >
          <Input maxLength={30} />
        </Form.Item>
        <Form.Item
          label="Path"
          name="path"
          validateTrigger="onBlur"
          rules={[
            {
              max: 40,
              min: 5,
              required: true,
              whitespace: true,
              validator: checkPath,
              message: '路径格式错误，必须以 / 开头，仅允许使用字母或数字',
              pattern: /^\/[a-zA-Z_]*[/a-zA-Z_0-9]{2,40}$/,
            },
          ]}
        >
          <Input maxLength={40} />
        </Form.Item>
        <Form.Item label="模块图标" name="icon" rules={[{ required: true }]}>
          <IconSelect />
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
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            data={data as never}
            keys={['id', 'name', 'children']}
            allowClear
            showSearch
            placeholder="请选择上级模块（留空为添加顶级模块）"
          />
        </Form.Item>
        <Row>
          <Col span={12}>
            <Form.Item
              label="显示顺序"
              name="orders"
              rules={[{ required: true, max: 5 }]}
            >
              <Input maxLength={5} />
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

      <ModuleLineList lines={lines} setLines={setLines} />
    </Drawer>
  );
};

export default ModuleAOEForm;
