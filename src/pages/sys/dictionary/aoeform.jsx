import React from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Button } from 'antd';
import { Form, Input, Select } from 'antx';

import LineList from './linelist';

@Form.create()
@connect(state => ({
  dict: state.dict,
  submitting: state.loading.effects['dict/save'],
}))
export default class DictForm extends React.PureComponent {
  render() {
    const { form } = this.props;

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };

    const formRowOne = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
    };

    return (
      <>
        <Form api={form} {...formItemLayout} colon>
          {/* 主表 */}
          <Card title="新增字典" extra={<Button type="primary">保存</Button>}>
            <Row>
              <Col span={12}>
                <Input label="字典编码" id="name" rules={['required']} max={30} msg="full" />
              </Col>
              <Col span={12}>
                <Select label="所属分类" id="name" rules={['required']} />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Input
                  textarea
                  label="备注"
                  id="remark"
                  rules={['max=200']}
                  max={200}
                  msg="full"
                  {...formRowOne}
                  rows={5}
                />
              </Col>
            </Row>
          </Card>
        </Form>
        <LineList />
      </>
    );
  }
}
