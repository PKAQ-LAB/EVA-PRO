import { App, Form, Input, Modal } from 'antd';
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import useFormDialogStyles from '@/components/FormDialog/useStyles';
import type { DictLine } from './data.d';

export type LineModalType = '' | 'create' | 'edit';

export interface LineAOEFormProps {
  modalType: LineModalType;
  setModalType: (v: LineModalType) => void;
  lines: DictLine[];
  setLines: (lines: DictLine[]) => void;
  editIndex: number | '';
  setEditIndex: (v: number | '') => void;
  isCurrent: () => boolean;
}

const TITLE: Record<Exclude<LineModalType, ''>, string> = {
  create: '新增',
  edit: '编辑',
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
}) => {
  const [form] = Form.useForm<DictLine>();
  const dialogStyles = useFormDialogStyles();
  const { modal } = App.useApp();
  const session = useMemo(
    () => ({ active: false }),
    [modalType, editIndex, lines, isCurrent],
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
    session.active && sessionRef.current === session && isCurrent();

  useEffect(() => {
    if (modalType === '') return;
    form.resetFields();
    if (editIndex !== '' && lines[editIndex]) {
      form.setFieldsValue(lines[editIndex]);
    }
  }, [modalType, editIndex, lines, form]);

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
        if (canWrite()) setModalType('');
      }}
      open={modalType !== ''}
      width={500}
      onOk={handleSaveClick}
      title={`${TITLE[modalType as 'create' | 'edit'] ?? '查看'}字典明细信息`}
    >
      <Form colon layout="horizontal" {...formItemLayout} form={form}>
        <Form.Item label="编码" name="keyName" rules={[{ required: true }]}>
          <Input maxLength={30} />
        </Form.Item>
        <Form.Item label="描述" name="keyValue" rules={[{ required: true }]}>
          <Input maxLength={30} />
        </Form.Item>
        <Form.Item label="排序" name="orders">
          <Input maxLength={5} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LineAOEForm;
