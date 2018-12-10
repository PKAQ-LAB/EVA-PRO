import React, { Component } from 'react';
import { Row, Col, Form, Input, InputNumber, Modal, Switch, TreeSelect } from 'antd';

const FormItem = Form.Item;
const Area = Input.TextArea;

@Form.create()
export default class AOEForm extends Component {
  componentDidMount() {
    // 加载树数据 - 只加载未停用状态的数据
    console.info('load purchasingOrder detail');
  }

  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'purchasingOrder/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 保存
  handleSaveClick = () => {
    const { dispatch, currentItem } = this.props;
    const { getFieldsValue, validateFields } = this.props.form;
    // 对校验过的表单域 再进行一次强制表单校验
    validateFields({ force: true }, errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
        id: currentItem.id,
      };
      dispatch({
        type: 'purchasingOrder/save',
        payload: data,
      });
    });
  };

  // 渲染界面
  render() {
    const { getFieldDecorator } = this.props.form;
    const { modalType, currentItem } = this.props;
    const cmView = modalType === 'view';

    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };
    const formRowOne = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19 },
    };

    return (
      <Modal
        maskClosable = {false}
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={600}
        onOk={() => this.handleSaveClick()}
        title={
          modalType === 'create'? '新增采购入库单': modalType === 'edit'
              ? '编辑采购入库单': '查看采购入库单'
        }
      >
        <Form>
          {/* 第一行 */}
          <FormItem label="入库单编码" hasFeedback {...formRowOne}>
            {getFieldDecorator('code', {
              initialValue: currentItem.code,
              rules: [{ required: true, message: '请输入采购单编码' }],
            })(<Input />)}
          </FormItem>
          {/* 第四行 */}
          <FormItem label="备注" hasFeedback {...formRowOne}>
            {getFieldDecorator('remark', {
              initialValue: currentItem.remark,
              rules: [
                {
                  message: '请输入备注',
                },
              ],
            })(<Area />)}
          </FormItem>
          {/* 第五行 */}
          {cmView && (
            <Row>
              <Col span={12}>
                <FormItem label="创建人" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="创建时间" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
            </Row>
          )}
          {/* 第六行 */}
          {cmView && (
            <Row>
              <Col span={12}>
                <FormItem label="修改人" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="修改时间" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>
    );
  }
}
