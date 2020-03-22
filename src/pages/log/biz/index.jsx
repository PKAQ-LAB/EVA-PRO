import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'umi';
import '@ant-design/compatible/assets/index.css';
import { Form, Button, Row, Col, Divider, DatePicker } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import WorkList from './list';
import AOEForm from './aoeform';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

@connect(state => ({
  bizlog: state.bizlog,
  loading: state.loading.models.bizlog,
}))
export default class Workdaily extends PureComponent {
  formRef = React.createRef();

  // 重置
  handleFormReset = () => {
    this.formRef.current.resetFields();
    this.props.dispatch({
      type: 'bizlog/fetch',
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
      param.begin = data.operateDatetime
        ? moment(data.operateDatetime[0]).format('YYYY-MM-DD')
        : '';
      param.end = data.operateDatetime ? moment(data.operateDatetime[1]).format('YYYY-MM-DD') : '';

      dispatch({
        type: 'bizlog/fetch',
        payload: param,
      });
    });
  };


  // 查询条件渲染
  renderSimpleForm() {
    const { loading } = this.props;

    return (
      <Form layout="inline" initialValues={{"operateDatetime":[moment().add(-7, 'days'), moment()]}} ref={this.formRef}>
        <Row type="flex" justify="space-between">
          <Col>
            <FormItem label="操作时间" name="operateDatetime">
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
    const { drawerCheck } = this.props.bizlog;
    return (
      <PageHeaderWrapper>
        <div className="eva-ribbon">{this.renderSimpleForm()}</div>
        <div className="eva-body">
          <WorkList />
        </div>
        {drawerCheck && <AOEForm />}
      </PageHeaderWrapper>
    );
  }
}
