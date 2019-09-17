import React from 'react';
import { Modal } from 'antd';
import { Form, Input } from 'antx';
import { connect } from 'dva';

@Form.create()
@connect(state => ({
  dict: state.dict,
}))
export default class DictLineForm extends React.PureComponent {
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

    const { validateFields } = this.props.form;
    validateFields((errors, values) => {
      if (errors) {
        return;
      }
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
          modalType: '',
          editIndex: '',
        },
      });
    });
  };

  render() {
    const { form } = this.props;
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
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={500}
        onOk={() => this.handleSaveClick()}
        title={`${title[modalType] || '查看'}字典明细信息`}
      >
        <Form api={form} colon layout="horizontal" {...formItemLayout} data={lineData[editIndex]}>
          <Input label="编码" id="keyName" rules={['required']} max={30} msg="full" />
          <Input label="描述" id="keyValue" rules={['required']} max={30} msg="full" />
          <Input label="排序" id="orders" rules={['number']} max={5} msg="full" />
        </Form>
      </Modal>
    );
  }
}
