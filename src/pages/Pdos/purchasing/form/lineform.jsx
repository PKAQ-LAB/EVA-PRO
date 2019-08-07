import React, { PureComponent } from 'react';
import { Row, Col, Form, Input, Modal, Tooltip, Icon } from 'antd';
import { connect } from 'dva';
import Selector from '@/components/Selector';

const FormItem = Form.Item;
const Area = Input.TextArea;

@Form.create()
@connect(state => ({
  waybillMgt: state.waybillMgt,
}))
export default class LineAOEForm extends PureComponent {
  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'waybillMgt/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 保存
  handleSaveClick = () => {
    const { lineData, editItem } = this.props.waybillMgt;

    const { validateFields } = this.props.form;
    validateFields((errors, values) => {
      if (errors) {
        return;
      }
      const data = {
        ...values,
      };

      if (values.unit) {
        data.unit = values.unit.key;
        data.unitName = values.unit.label;
      }

      if (editItem || editItem === 0) {
        // eslint-disable-next-line
        Object.assign(lineData[editItem], data);
      } else {
        lineData.push(data);
      }

      // 关闭当前新增页面
      this.props.dispatch({
        type: 'waybillMgt/updateState',
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
          type: 'waybillMgt/isBlackCar',
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
    const { modalType, editItem, lineData } = this.props.waybillMgt;

    const currentItem = lineData[editItem];

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const formRowOne = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    return (
      <Modal
        maskClosable={false}
        cancelText="关闭"
        okText="提交"
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={800}
        onOk={() => this.handleSaveClick()}
        title={modalType === 'create' ? '新增运单明细' : '编辑运单明细'}
      >
        <Form {...formItemLayout}>
          {/* 第一行 */}
          <Row>
            <Col span={12}>
              <FormItem label="货品名称" hasFeedback>
                {getFieldDecorator('goodsName', {
                  initialValue: currentItem && currentItem.goodsName,
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
                {getFieldDecorator('goodsType', {
                  initialValue: currentItem && currentItem.goodsType,
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
          <Row>
            <Col span={12}>
              <FormItem label="车牌号" hasFeedback>
                {getFieldDecorator('carNum', {
                  initialValue: currentItem && currentItem.carNum,
                  // validateTrigger: 'onBlur',
                  rules: [
                    {
                      pattern: /^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Za-z](([0-9]{5}[DFdf])|([DFdf]([A-Ha-hJ-Nj-nP-Zp-z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Za-z][A-Ha-hJ-Nj-nP-Zp-z0-9]{4}[A-Ha-hJ-Nj-nP-Zp-z0-9挂学警港澳使领]))$/,
                      message: '请输入正确车牌号',
                    },
                    // { validator: this.checkBlack },
                  ],
                })(
                  <Input
                    placeholder="中间不含空格，注意字母要大写"
                    style={{ textTransform: 'uppercase' }}
                    suffix={
                      <span>
                        <Tooltip title="车牌为7-8位组合(不含空格，字母大写)">
                          <Icon type="question-circle-o" />
                        </Tooltip>
                      </span>
                    }
                  />
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="储罐编号" hasFeedback>
                {getFieldDecorator('tankNumber', {
                  initialValue: currentItem && currentItem.tankNumber,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          {/* 第三行 */}
          <Row>
            <Col span={12}>
              <FormItem label="计划量" hasFeedback>
                {getFieldDecorator('planAmount', {
                  initialValue: currentItem && currentItem.planAmount,
                  rules: [
                    {
                      pattern: /^[0-9,.]*$/,
                      message: '仅允许输入数字',
                    },
                  ],
                })(<Input type="number" />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="单位" hasFeedback>
                {getFieldDecorator('unit', {
                  initialValue: currentItem && currentItem.unit,
                  validateTrigger: 'onBlur',
                })(<Selector defaultValue="0001" code="unit" labelInValue />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem label="备注" hasFeedback {...formRowOne} style={{ marginBottom: 0 }}>
                {getFieldDecorator('remark', {
                  initialValue: currentItem && currentItem.remark,
                  rules: [{ message: '请输入备注' }],
                })(<Area autosize={{ minRows: 3, maxRows: 5 }} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
