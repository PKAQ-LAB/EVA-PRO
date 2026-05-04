import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  App,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Switch,
  Tooltip,
  TreeSelect,
} from 'antd';
import React, { useEffect, useState } from 'react';
import type { OrgItem } from './data.d';
import { checkOrgUnique, editOrg } from './service';

export type OperateType = '' | 'create' | 'edit';

export interface OrgAOEFormProps {
  operateType: OperateType;
  currentItem: Partial<OrgItem>;
  data: OrgItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const formItemLayout = {
  labelCol: { flex: '0 0 100px' },
  wrapperCol: { flex: 'auto' },
};

const TITLE: Record<Exclude<OperateType, ''>, string> = {
  create: '新增',
  edit: '编辑',
};

const OrgAOEForm: React.FC<OrgAOEFormProps> = ({
  operateType,
  currentItem,
  data,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<OrgItem & { enable?: boolean }>();
  const { message: msg } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (operateType === '') return;
    form.resetFields();
    form.setFieldsValue({
      ...(currentItem as OrgItem),
      enable: currentItem.status ? currentItem.status === '0001' : true,
    });
  }, [operateType, currentItem, form]);

  const checkCode = async (_: unknown, value: string) => {
    if (currentItem?.id && value === currentItem.code) return;
    const res = await checkOrgUnique(value);
    if (!res.success) throw new Error(res.message ?? '编码已存在');
  };

  const handleSaveClick = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const res = await editOrg({
        ...values,
        id: currentItem.id,
        status: values.enable ? '0001' : '0000',
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
    <Modal
      maskClosable={false}
      confirmLoading={submitting}
      onCancel={onClose}
      open={operateType !== ''}
      width={700}
      centered
      onOk={handleSaveClick}
      title={`${TITLE[operateType as 'create' | 'edit'] ?? '查看'}部门信息`}
    >
      <Form colon form={form} labelAlign="left" {...formItemLayout}>
        <Form.Item name="name" label="部门名称" rules={[{ required: true }]}>
          <Input maxLength={30} />
        </Form.Item>
        <Form.Item
          name="code"
          label="部门编码"
          validateTrigger="onBlur"
          hasFeedback
          rules={[
            {
              message: '编码格式错误，仅允许使用字母或数字',
              pattern: /^[a-zA-Z_0-9]{2,40}$/,
              required: true,
              whitespace: true,
              validator: checkCode,
            },
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
            treeData={data as never}
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
    </Modal>
  );
};

export default OrgAOEForm;
