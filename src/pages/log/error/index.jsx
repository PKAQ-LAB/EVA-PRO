import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Button, Form, Row, Col, Divider, DatePicker } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

@Form.create()
@connect(({ loading, errorLog }) => ({
  loading: loading.models.errorLog,
  error: errorLog,
}))
export default class Error extends PureComponent {
  // 重置
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'errorLog/fetch',
    });
  };

  // 查询
  handleSearch = () => {
    const { form, dispatch } = this.props;
    const { validateFields, getFieldsValue } = form;
    validateFields(errors => {
      if (errors) return;
      const data = {
        ...getFieldsValue(),
      };

      const param = {};
      param.begin = data.requestTime ? moment(data.requestTime[0]).format('YYYY-MM-DD') : '';
      param.end = data.requestTime ? moment(data.requestTime[1]).format('YYYY-MM-DD') : '';

      dispatch({
        type: 'errorLog/fetch',
        payload: param,
      });
    });
  };

  // 按钮
  renderRightBtn() {
    const { loading } = this.props;
    return (
      <div>
        <Button type="primary" onClick={this.handleSearch} loading={loading}>
          查询
        </Button>
        <Divider type="vertical" />
        <Button onClick={this.handleFormReset} loading={loading}>
          重置
        </Button>
      </div>
    );
  }

  // 查询条件渲染
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <Row type="flex" justify="space-between">
          <Col>
            <FormItem label="操作时间">
              {getFieldDecorator('requestTime', {
                initialValue: [moment().add(-7, 'days'), moment()],
              })(<RangePicker />)}
            </FormItem>
          </Col>
          <Col>
            <FormItem>{this.renderRightBtn()}</FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { modalType } = this.props.error;

    return (
      <PageHeaderWrapper>
        <div className="eva-ribbon">{this.renderSimpleForm()}</div>
        <div className="eva-body">
          <List />
        </div>
        {modalType !== '' && <AOEForm />}
      </PageHeaderWrapper>
    );
  }
}
