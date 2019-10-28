import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, DatePicker, Button, Divider, Modal } from 'antd';
import { Form, Input } from 'antx';

import Selector from '@src/components/Selector';
import emitter from '@src/utils/events';

@Form.create()
@connect(state => ({
  submitting: state.loading.effects['purchasing/save'],
  purchasing: state.purchasing,
  global: state.global,
}))
export default class MainAOEForm extends React.PureComponent {
  componentDidMount() {
    const { form } = this.props;
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
      Modal.error({ title: '明细数据不允许为空' });
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
    const { dict } = this.props.global;
    const { view = false, form } = this.props;
    const { currentItem, viewItem } = this.props.purchasing;
    if (view) {
      viewItem.orderDate = moment(viewItem.orderDate);
    } else {
      currentItem.orderDate = moment(currentItem.orderDate);
    }


    // 表单布局
    const formItemLayout = {
      labelCol: {
        xs: { span: 10 },
        sm: { span: 8 },
        md: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 14 },
        sm: { span: 16 },
        md: { span: 18 },
      },
    };

    return (
      <Card
        title="基本信息"
        extra={this.renderBtn()}
        headStyle={{ padding: 0 }}
        bodyStyle={{ padding: '10px 0' }}
        bordered={false}
      >
        <Form
          api={form}
          data={view ? viewItem : currentItem}
          labelAlign="left"
          layout="horizontal"
          {...formItemLayout}
        >
          {/* 第 1 行 */}
          <Row gutter={24}>
            <Col span={8}>
              <Input
                label="入库单号"
                id="code"
                disabled={view}
                min={4}
                max={16}
                msg="请输入入库单号"
                validateTrigger="onBlur"
                rules={[
                  {
                    required: true,
                    message: '账号格式错误或已存在',
                    whitespace: true,
                    pattern: /^[0-9a-zA-Z_]{4,16}$/,
                    validator: this.checkCode,
                  },
                ]}
              />
            </Col>
            <Col span={8}>
              <DatePicker
                label="入库日期"
                disabled={view}
                format="YYYY-MM-DD HH:mm:ss"
                id="orderDate"
                rule={['required']}
              />
            </Col>
            <Col span={8}>
              <Selector label="采购类型" data={dict.purchasing_type} disabled={view} id="stock" />
            </Col>
          </Row>
          {/* 第 2 行 */}
          <Row gutter={24}>
            <Col span={8}>
              <Input disabled={view} id="operatorNm" label="制单人" />
            </Col>
            <Col span={8}>
              <Input disabled={view} id="purchaserNm" label="采购人" />
            </Col>
            <Col span={8}>
              <Input disabled={view} id="supplierNm" label="供应商" />
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }
}
