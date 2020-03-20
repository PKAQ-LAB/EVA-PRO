import React from 'react';
import { Form, Input, Modal } from 'antd';
import { connect } from 'umi';

@connect(state => ({
  module: state.module,
}))
export default class ModuleLineForm extends React.PureComponent {
  formRef = React.createRef();

  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'module/updateState',
      payload: {
        operate: '',
      },
    });
  };

  // 保存
  handleSaveClick = () => {
    const { lineData, editIndex } = this.props.module;

    const { validateFields } = this.formRef.current;

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

      // 关闭当前新增页面
      this.props.dispatch({
        type: 'module/updateState',
        payload: {
          operate: '',
          editIndex: '',
        },
      });
    })
  };

  render() {
    const { operate, lineData, editIndex } = this.props.module;

    const title = { create: '新增', edit: '编辑' };

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };

    return (
      <Modal
        maskClosable={false}
        cancelText="取消"
        okText="提交"
        centered
        onCancel={() => this.handleCloseForm()}
        visible={operate !== ''}
        width={500}
        onOk={() => this.handleSaveClick()}
        title={`${title[operate] || '查看'}资源`}
      >
        <Form initialValues={lineData[editIndex]} ref={this.formRef} colon layout="horizontal" {...formItemLayout} >
          <Form.Item
                  label="资源描述"
                  name="resourceDesc"
                  rules={[{required: true,len: 30}]}>
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
}
