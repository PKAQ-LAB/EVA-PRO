import React, { PureComponent } from 'react';
import { Row, Col, Form, Input, Modal } from 'antd';
import { connect } from 'dva';
import Selector from '@/components/Selector';

const FormItem = Form.Item;

@Form.create()
@connect(state => ({
  purchasing: state.purchasing,
}))
export default class LineAOEForm extends PureComponent {
  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'purchasing/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 保存
  handleSaveClick = () => {
    const { lineData, editItem } = this.props.purchasing;

    const { validateFields } = this.props.form;
    validateFields((errors, values) => {
      if (errors) {
        return;
      }
      const data = {
        ...values,
      };

      // if (values.unit) {
      //   data.unit = values.unit.key;
      //   data.unitName = values.unit.label;
      // }

      if (editItem || editItem === 0) {
        // eslint-disable-next-line
        Object.assign(lineData[editItem], data);
      } else {
        lineData.push(data);
      }

      // 关闭当前新增页面
      this.props.dispatch({
        type: 'purchasing/updateState',
        payload: {
          modalType: '',
        },
      });
    });
  };
  // eslint-disable-next-line
  checkBlack = (rule, value, callback) => {
    const { getFieldValue } = this.props.form;
    const carNum = getFieldValue('carNum');
    if (carNum) {
      this.props
        .dispatch({
          type: 'purchasing/isBlackCar',
          payload: {
            carNum,
          },
        })
        .then(r => {
          if (r.success) {
            return callback();
          }
          return callback(r.data);
        });
    } else {
      return callback();
    }
  };

  // 渲染界面
  render() {
    const { getFieldDecorator } = this.props.form;
    const { modalType, editItem, lineData } = this.props.purchasing;

    const currentItem = lineData[editItem];

    const formItemLayout = {
      labelCol: {
        xs: { span: 12 },
        sm: { span: 10 },
        md: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 14 },
        md: { span: 16 },
      },
    };

    return (
      <Modal
        maskClosable={false}
        cancelText="关闭"
        okText="提交"
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={600}
        onOk={() => this.handleSaveClick()}
        title={modalType === 'create' ? '新增采购入库单明细' : '编辑采购入库单明细'}
      >
        <Form {...formItemLayout}>
          {/* 第一行 */}
          <Row>
            <Col span={12}>
              <FormItem label="货品名称" hasFeedback>
                {getFieldDecorator('name', {
                  initialValue: currentItem && currentItem.name,
                  rules: [
                    {
                      message: '请输入货品名称',
                      required: true,
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="货品类型" hasFeedback>
                {getFieldDecorator('category', {
                  initialValue: currentItem && currentItem.category,
                  rules: [
                    {
                      message: '请输入货品类型',
                      required: true,
                    },
                  ],
                })(<Selector code="goods_type" />)}
              </FormItem>
            </Col>
          </Row>
          {/* 第 2 行 */}
          <Row>
            <Col span={12}>
              <FormItem label="型号" hasFeedback>
                {getFieldDecorator('model', {
                  initialValue: currentItem && currentItem.model,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="条码" hasFeedback>
                {getFieldDecorator('barcode', {
                  initialValue: currentItem && currentItem.barcode,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
