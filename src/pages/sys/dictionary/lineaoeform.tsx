import { App, Button, Form, Input, Modal } from 'antd';
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import useFormDialogStyles from '@/components/FormDialog/useStyles';
import type { DictLine } from './data.d';

export type LineModalType = '' | 'create' | 'edit' | 'view';

export interface LineAOEFormProps {
  modalType: LineModalType;
  setModalType: (v: LineModalType) => void;
  lines: DictLine[];
  setLines: (lines: DictLine[]) => void;
  editIndex: number | '';
  setEditIndex: (v: number | '') => void;
  isCurrent: () => boolean;
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

const LineAOEForm: React.FC<LineAOEFormProps> = ({
  modalType,
  setModalType,
  lines,
  setLines,
  editIndex,
  setEditIndex,
  isCurrent,
  readOnly = false,
}) => {
  const [form] = Form.useForm<DictLine>();
  const dialogStyles = useFormDialogStyles();
  const { modal } = App.useApp();
  const isView = modalType === 'view';
  const record = editIndex !== '' ? lines[editIndex] : undefined;
  const textValue = (value: unknown) => (
    <div className="eva-view-value">{String(value ?? '').trim() || '—'}</div>
  );
  const session = useMemo(
    () => ({ active: false }),
    [modalType, editIndex, lines, isCurrent, readOnly],
  );
  const sessionRef = useRef(session);
  sessionRef.current = session;
  useLayoutEffect(() => {
    session.active = true;
    return () => {
      session.active = false;
    };
  }, [session]);
  const canWrite = () =>
    (modalType === 'create' || modalType === 'edit') &&
    !readOnly &&
    session.active &&
    sessionRef.current === session &&
    isCurrent();

  useEffect(() => {
    if (modalType === '' || isView) return;
    form.resetFields();
    if (editIndex !== '' && lines[editIndex]) {
      form.setFieldsValue(lines[editIndex]);
    }
  }, [modalType, editIndex, lines, form, isView]);

  const handleSaveClick = async () => {
    if (!canWrite()) return;
    const values = await form.validateFields().catch(() => undefined);
    if (!values || !canWrite()) return;
    // 校验编码是否重复
    const exist = lines.find(
      (v, i) => values.keyName === v.keyName && i !== editIndex,
    );
    if (exist) {
      modal.warning({ title: '编码重复', content: '字典编码已经存在' });
      return;
    }
    const next = [...lines];
    if (editIndex !== '') {
      next[editIndex] = { ...next[editIndex], ...values };
    } else {
      next.push(values);
    }
    setModalType('');
    setEditIndex('');
    setLines(next);
  };

  return (
    <Modal
      styles={dialogStyles}
      maskClosable={false}
      cancelText="取消"
      okText="提交"
      centered
      onCancel={() => {
        if (isView || canWrite()) setModalType('');
      }}
      open={modalType !== ''}
      width={500}
      onOk={isView ? undefined : handleSaveClick}
      footer={
        isView ? (
          <Button onClick={() => setModalType('')}>关闭</Button>
        ) : undefined
      }
      title={`${TITLE[modalType as Exclude<LineModalType, ''>] ?? '查看'}字典明细信息`}
    >
      <Form
        component={isView ? 'div' : 'form'}
        colon
        layout="horizontal"
        {...formItemLayout}
        form={isView ? undefined : form}
      >
        <Form.Item
          label="编码"
          name={isView ? undefined : 'keyName'}
          rules={isView ? undefined : [{ required: true }]}
        >
          {isView ? textValue(record?.keyName) : <Input maxLength={30} />}
        </Form.Item>
        <Form.Item
          label="描述"
          name={isView ? undefined : 'keyValue'}
          rules={isView ? undefined : [{ required: true }]}
        >
          {isView ? textValue(record?.keyValue) : <Input maxLength={30} />}
        </Form.Item>
        <Form.Item label="排序" name={isView ? undefined : 'orders'}>
          {isView ? textValue(record?.orders) : <Input maxLength={5} />}
        </Form.Item>
        <Form.Item label="备注">{textValue(record?.remark)}</Form.Item>
      </Form>
    </Modal>
  );
};

export default LineAOEForm;
