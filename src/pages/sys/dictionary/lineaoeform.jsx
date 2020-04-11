import React from 'react';
import { Form, Input, Modal } from 'antd';
import { connect } from 'umi';


@connect(state => ({
  dict: state.dict,
}))
export default class DictLineForm extends React.PureComponent {
  formRef = React.createRef();

  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'dict/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 保存
  handleSaveClick = () => {
    const { lineData, editIndex } = this.props.dict;
    const { validateFields } = this.formRef.current;

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
      this.props.dispatch({
        type: 'dict/updateState',
        payload: {
          lineData: [...lineData],
          modalType: '',
          editIndex: '',
        },
      });
    });
  };

  render() {
    const { modalType, lineData, editIndex } = this.props.dict;

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
        visible={modalType !== ''}
        width={500}
        onOk={() => this.handleSaveClick()}
        title={`${title[modalType] || '查看'}字典明细信息`}
      >
        <Form colon layout="horizontal" {...formItemLayout} initialValues={lineData[editIndex]} ref={this.formRef}>
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
}
