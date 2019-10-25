import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Input, DatePicker, Form, Button, Divider, Modal } from 'antd';

import Selector from '@src/components/Selector';
import emitter from '@src/utils/events';

const FormItem = Form.Item;
/* eslint-disable */
@Form.create()
@connect(state => ({
  submitting: state.loading.effects['purchasing/save'],
  purchasing: state.purchasing,
}))
export default class MainAOEForm extends React.PureComponent {
  componentDidMount() {
    const form = this.props.form;
    emitter.on('purchasingFormReset', () => {
      form.resetFields();
    });
  }
  // 关闭
  handleCancelClick = () => {
    this.props.dispatch({
      type: 'purchasing/updateState',
      payload: {
        editTab: false,
        activeKey: 'list',
        operateType: '',
        // 清空编辑时留存的数据
        currentItem: {},
        lineData: [],
        selectedLineRowKeys: [],
      },
    });
  };

  // 重置事件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'purchasing/updateState',
      payload: {
        operateType: '',
        // 清空编辑时留存的数据
        currentItem: {},
        lineData: [],
        selectedLineRowKeys: [],
      },
    });
  };

  // 保存信息
  handleSave = () => {
    const { dispatch } = this.props;
    const { getFieldsValue, validateFields } = this.props.form;
    const { currentItem, lineData } = this.props.purchasing;

    if (!lineData || lineData.length < 1) {
      Modal.error({ title: `明细数据不允许为空` });
      return;
    }

    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
        id: currentItem.id,
        line: lineData,
      };

      dispatch({
        type: 'purchasing/save',
        payload: data,
      });
    });
  };

  // 校验入库单号得唯一性
  checkCode = (rule, value, callback) => {
    const { id } = this.props.purchasing.currentItem;
    // 判断当前用户是否是企业
    const { getFieldValue } = this.props.form;

    const code = getFieldValue('code');

    if (!code) return;

    this.props
      .dispatch({
        type: 'purchasing/checkCode',
        payload: {
          id,
          code,
        },
      })
      .then(r => {
        if (r && r.data) {
          return callback(`采购入库单号 ${code} 已存在，请重新输入`);
        }
        return callback();
      });
  };

  // 渲染按钮
  renderBtn() {
    const { submitting, view = false } = this.props;
    return (
      <div>
        {!view && (
          <Button type="primary" onClick={() => this.handleSave()} loading={submitting}>
            提交保存
          </Button>
        )}
        {!view && <Divider type="vertical" />}
        {!view && <Button onClick={() => this.handleFormReset()}>重填</Button>}
        {!view && <Divider type="vertical" />}
        <Button onClick={() => this.handleCancelClick()}>取消</Button>
      </div>
    );
  }

  render() {
    const { view = false } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { currentItem, viewItem } = this.props.purchasing;

    // 表单布局
    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 6 },
        md: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 16 },
        md: { span: 18 },
      },
    };

    return (
      <Card title="采购入库单基本信息" extra={this.renderBtn()}>
        <Form layout="horizontal" {...formItemLayout}>
          {/* 第 1 行 */}
          <Row gutter={24}>
            <Col span={8}>
              <FormItem label="入库单号">
                {getFieldDecorator('code', {
                  initialValue: view ? viewItem.code : currentItem.code,
                  validateTrigger: 'onBlur',
                  rules: [
                    { validator: this.checkCode },
                    { message: '请输入入库单号', required: true },
                  ],
                })(<Input disabled={view} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="入库日期">
                {getFieldDecorator('orderDate', {
                  initialValue: moment(view ? viewItem.orderDate : currentItem.orderDate),
                  rules: [{ message: '请选择入库日期', required: true }],
                })(<DatePicker disabled={view} format="YYYY-MM-DD HH:mm:ss" />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="采购类型">
                {getFieldDecorator('stock', {
                  initialValue: view ? viewItem.stock : currentItem.stock,
                })(<Selector code="purchasing_type" disabled={view} />)}
              </FormItem>
            </Col>
          </Row>
          {/* 第 2 行 */}
          <Row gutter={24}>
            <Col span={8}>
              <FormItem label="制单人">
                {getFieldDecorator('operatorNm', {
                  initialValue: view ? viewItem.operatorNm : currentItem.operatorNm,
                })(<Input disabled={view} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="采购人">
                {getFieldDecorator('purchaserNm', {
                  initialValue: view ? viewItem.purchaserNm : currentItem.purchaserNm,
                })(<Input disabled={view} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="供应商">
                {getFieldDecorator('supplierNm', {
                  initialValue: view ? viewItem.supplierNm : currentItem.supplierNm,
                })(<Input disabled={view} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }
}
