import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Button, Form, Row, Col, Divider, DatePicker } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import WorkList from './list';
import AOEForm from './aoeform';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

@Form.create()
@connect(state => ({
  bizlog: state.bizlog,
  loading: state.loading.models.bizlog,
}))
export default class Workdaily extends PureComponent {
  // 重置
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'bizlog/fetch',
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
              {getFieldDecorator('operateDatetime', {
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
