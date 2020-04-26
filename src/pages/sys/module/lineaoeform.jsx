import React from 'react';
import { Form, Input, Modal } from 'antd';

export default (props) => {
  const [ form ] = Form.useForm();
  const { operate, setOperate, lineData, setLineData, editIndex, setEditIndex } = props;
  const title = { create: '新增', edit: '编辑' };

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
        const exist = lineData.find(
          (v, i) => data.resourceUrl === v.resourceUrl && i !== editIndex,
        );
        if (exist) {
          Modal.warning({
            title: '路径重复',
            content: '资源路径已经存在',
          });
          return;
        }
      }

      if (editIndex || editIndex === 0) {
        Object.assign(lineData[editIndex], data);
      } else {
        lineData.push(data);
      }

      setOperate("");
      setEditIndex("");
      setLineData(lineData);
    })
  };

    return (
      <Modal
        maskClosable={false}
        cancelText="取消"
        okText="提交"
        centered
        onCancel={() => setOperate("")}
        visible={operate !== ''}
        width={500}
        onOk={() => handleSaveClick()}
        title={`${title[operate] || '查看'}资源`}
      >
        <Form initialValues={lineData[editIndex]} form={form} colon layout="horizontal" {...formItemLayout} >
          <Form.Item
                  label="资源描述"
                  name="resourceDesc"
                  rules={[{required: true,max: 30}]}>
            <Input/>
          </Form.Item>

          <Form.Item
                  label="资源路径"
                  name="resourceUrl"
                  rules={[{
                    required: true,
                    len: 300,
                    whitespace: true,
                    pattern: new RegExp(/^\/[a-zA-Z_]*[/a-zA-Z_0-9]{2,40}$/),
                    message: '路径格式错误, 必须以‘/’开头，仅允许使用字母或数字.',
                  },
                ]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    );
}
