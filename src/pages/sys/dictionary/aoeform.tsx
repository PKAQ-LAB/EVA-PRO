import { useModel } from '@umijs/max';
import { App, Button, Card, Col, Form, Input, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { DictSelector } from '@/components';
import type { DictItem, DictLine } from './data.d';
import LineList from './linelist';
import { editDict } from './service';

export type OperateType = '' | 'create' | 'edit' | 'view';

export interface DictAOEFormProps {
  operateType: OperateType;
  setOperateType: (v: OperateType) => void;
  currentItem: Partial<DictItem>;
  onSuccess: () => void;
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

const DictAOEForm: React.FC<DictAOEFormProps> = ({
  operateType,
  setOperateType,
  currentItem,
  onSuccess,
}) => {
  const [form] = Form.useForm<DictItem>();
  const { message: msg } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [lines, setLines] = useState<DictLine[]>(currentItem?.lines ?? []);
  const { initialState } = useModel('@@initialState');
  const dictTypeMap = (
    initialState?.dict as Record<string, unknown> | undefined
  )?.dict_type as Record<string, string> | undefined;

  useEffect(() => {
    setLines(currentItem?.lines ?? []);
    form.resetFields();
    if (currentItem) form.setFieldsValue(currentItem as DictItem);
  }, [currentItem, form]);

  const isReadOnly = operateType === '' || operateType === 'view';

  const handleSaveClick = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const res = await editDict({
        ...values,
        id: currentItem.id,
        lines,
      });
      if (res.success) {
        msg.success('保存成功');
        setOperateType('view');
        onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Form colon form={form} {...formItemLayout}>
        <Card
          title={`${TITLE[operateType as 'create' | 'edit' | 'view'] ?? ''}字典信息`}
          extra={
            <Button
              loading={submitting}
              type="primary"
              onClick={handleSaveClick}
              disabled={isReadOnly}
            >
              保存
            </Button>
          }
        >
          <Row>
            <Col span={12}>
              <Form.Item
                label="所属分类"
                name="parentId"
                rules={[{ required: true }]}
              >
                <DictSelector data={dictTypeMap} disabled={isReadOnly} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="字典编码"
                name="code"
                rules={[{ required: true }]}
              >
                <Input maxLength={30} disabled={isReadOnly} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="字典描述"
                name="name"
                rules={[{ required: true }]}
              >
                <Input maxLength={30} disabled={isReadOnly} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item label="备注" name="remark">
                <Input.TextArea
                  maxLength={200}
                  disabled={isReadOnly}
                  rows={5}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
      <LineList lines={lines} setLines={setLines} operateType={operateType} />
    </>
  );
};

export default DictAOEForm;
