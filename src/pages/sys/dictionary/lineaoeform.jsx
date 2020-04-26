import React from 'react';
import { Form, Input, Modal } from 'antd';

export default (props) => {

  const [ form ] = Form.useForm();

  const title = { create: '新增', edit: '编辑' };
  const { modalType, setModalType, lineData, setLineData, editIndex, setEditIndex } = props;

  const formItemLayout = {
    labelCol: { flex: '0 0 100px' },
    wrapperCol: { flex: 'auto' },
  };

  // 保存
  const handleSaveClick = () => {
    const { validateFields } = form;

    validateFields().then(values => {
      const data = {
        ...values,
      };

      // 校验编码是否重复
      if (lineData) {
        const exist = lineData.find((v, i) => data.keyName === v.keyName && i !== editIndex);
        if (exist) {
          Modal.warning({
            title: '编码重复',
            content: '字典编码已经存在',
          });
          return;
        }
      }

      if (editIndex || editIndex === 0) {
        Object.assign(lineData[editIndex], data);
      } else {
        lineData.push(data);
      }

      // 关闭当前新增页面
      setModalType("");
      setEditIndex("");
      setLineData([...lineData]);
    });
  };

  return (
    <Modal
      maskClosable={false}
      cancelText="取消"
      okText="提交"
      centered
      onCancel={() => setModalType("")}
      visible={modalType !== ''}
      width={500}
      onOk={() => handleSaveClick()}
      title={`${title[modalType] || '查看'}字典明细信息`}
    >
      <Form colon layout="horizontal" {...formItemLayout} initialValues={lineData[editIndex]} form={form}>
        <Form.Item
                label="编码"
                name="keyName"
                rules={[{required: true,}]}>
          <Input max={30} />
        </Form.Item>

        <Form.Item
                label="描述"
                name="keyValue"
                rules={[{required: true,}]}>
          <Input max={30} />
        </Form.Item>

        <Form.Item
                label="排序"
                name="orders">
          <Input max={5} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
