import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Button, Form } from 'antd';

const FormItem = Form.Item;

@Form.create()
@connect(state => ({
  purchasing: state.jxc_purchasing,
}))
export default class purchasingAOEForm extends PureComponent {
  // 页面切换
  tabChange = event => {
    this.props.dispatch({
      type: 'jxc_purchasing/tabChange',
      payload: {
        tabType: event[0]
      },
    });
  };

  // 查看时处于只读状态
  readOnly = event => {
    this.props.dispatch({
      type: 'jxc_purchasing/updateState',
      payload: {
        readOnly: event
      },
    });
  };

  // 保存信息
  handleSave = () => {
    const { dispatch } = this.props;
    const { getFieldsValue, validateFields } = this.props.form;
    const { currentItem } = this.props.purchasing;
    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
        id: currentItem.id,
      };
      dispatch({
        type: 'jxc_purchasing/save',
        payload: data,
      });
      this.tabChange(['main']);
    });
  };

  // 提交按钮
  renderSubmitBtn() {
    const { hideSubmitBtn } = this.props.purchasing;
    return (
      <Row>
        <Col span={2} offset={18}>
          <Button
            type="primary"
            htmlType="submit"
            style={
              hideSubmitBtn
              ? { display: 'none' }
              : { display: 'inline-block' }
            }
          >
            提交
          </Button>
        </Col>
        <Col span={2}>
          <Button
            onClick={() => {
              this.tabChange(['main']);
              this.readOnly(false);
            }}
          >
            返回
          </Button>
        </Col>
      </Row>
    );
  }

  render() {
    return (
      <Card>
        <Form onSubmit={this.handleSave}>
          <FormItem>{this.renderSubmitBtn()}</FormItem>
        </Form>
      </Card>
    );
  }
}
