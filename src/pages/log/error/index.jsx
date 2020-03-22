import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'umi';
import '@ant-design/compatible/assets/index.css';
import { Form, Button, Row, Col, Divider, DatePicker } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

@connect(({ loading, errorLog }) => ({
  loading: loading.models.errorLog,
  error: errorLog,
}))
export default class Error extends PureComponent {

  formRef = React.createRef();

  // 重置
  handleFormReset = () => {
    this.formRef.current.resetFields();
    this.props.dispatch({
      type: 'errorLog/fetch',
    });
  };

  // 查询
  handleSearch = () => {
    const { dispatch } = this.props;
    const { validateFields } = this.formRef.current;
    validateFields().then(values => {
      const data = {
        ...values,
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

  // 查询条件渲染
  renderSimpleForm() {
    const { loading } = this.props;

    return (
      <Form layout="inline" initialValues={{"requestTime": [moment().add(-7, 'days'), moment()]}} ref={this.formRef}>
        <Row type="flex" justify="space-between">
          <Col>
            <FormItem label="操作时间" name="requestTime">
              <RangePicker />
            </FormItem>
          </Col>
          <Col>
            <FormItem>
              <Button type="primary" onClick={this.handleSearch} loading={loading}>
                查询
              </Button>
              <Divider type="vertical" />
              <Button onClick={this.handleFormReset} loading={loading}>
                重置
              </Button>
            </FormItem>
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
