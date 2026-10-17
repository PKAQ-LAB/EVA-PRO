import { App, Button, Card, Col, Form, Input, Row } from 'antd';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { DictItem, DictLine } from './data.d';
import LineList from './linelist';
import { isReadonlyDict } from './readonly';
import { editDict } from './service';

export type OperateType = '' | 'create' | 'edit' | 'view';

export interface DictAOEFormProps {
  operateType: OperateType;
  setOperateType: (v: OperateType) => void;
  currentItem: Partial<DictItem>;
  onSuccess: () => Promise<void> | void;
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

  useEffect(() => {
    setLines(currentItem?.lines ?? []);
    form.resetFields();
    if (currentItem) form.setFieldsValue(currentItem as DictItem);
  }, [currentItem, form]);

  const isReadOnly =
    operateType === '' || operateType === 'view' || isReadonlyDict(currentItem);
  // 每次对象或只读上下文切换都建立新会话，返回同一对象也不恢复旧回调。
  const session = useMemo(() => ({ active: false }), [currentItem, isReadOnly]);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const isCurrent = useCallback(
    () => session.active && sessionRef.current === session && !isReadOnly,
    [session, isReadOnly],
  );
  useLayoutEffect(() => {
    session.active = true;
    setSubmitting(false);
    return () => {
      session.active = false;
    };
  }, [session]);

  const handleSaveClick = async () => {
    if (!isCurrent() || submitting) return;
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      if (!isCurrent()) return;
      const res = await editDict({
        ...values,
        id: currentItem.id,
        lines,
      });
      if (isCurrent() && res.success) {
        msg.success('保存成功');
        setOperateType('view');
        await onSuccess();
      }
    } finally {
      if (isCurrent()) setSubmitting(false);
    }
  };

  return (
    <>
      <Form colon form={form} layout="horizontal" {...formItemLayout}>
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
      <LineList
        lines={lines}
        setLines={(next) => {
          if (isCurrent()) setLines(next);
        }}
        isCurrent={isCurrent}
        operateType={isReadOnly ? 'view' : operateType}
      />
    </>
  );
};

export default DictAOEForm;
