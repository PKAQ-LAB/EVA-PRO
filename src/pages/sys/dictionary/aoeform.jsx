import React from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Button } from 'antd';
import { Form, Input, Select } from 'antx';

import LineList from './linelist';

@Form.create()
@connect(state => ({
  dict: state.dict,
  submitting: state.loading.effects['dict/editDict'],
}))
export default class DictForm extends React.PureComponent {
  // 保存事件
  handleSaveClick = () => {
    const { form } = this.props;
    const { lineData, currentItem } = this.props.dict;
    const { getFieldsValue, validateFields } = this.props.form;

    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
        id: currentItem.id,
      };
      data.lines = lineData;

      this.props.dispatch({
        type: 'dict/editDict',
        payload: data,
      }).then(() => {
        // fix 保存后清空表单
        // form.resetFields();
      });
    });
  };

  render() {
    const { form, submitting } = this.props;
    const { operate, dicts, currentItem } = this.props.dict;

    const options = dicts ? dicts.filter(i => i.parentId === '0' || !i.parentId) : [];

    const title = { create: '新增', edit: '编辑', view: '查看' };

    const formItemLayout = {
      labelCol: {  sm:{ span: 12 }, xs:{ span: 8 }, md:{ span: 8 }, lg:{ span: 6 } },
      wrapperCol: {  sm:{ span: 12 }, xs:{ span: 16 }, md:{ span: 16 }, lg:{ span: 18 } },
    };

    const formRowOne = {
      labelCol: { sm:{ span: 6 }, xs:{ span: 6 }, md:{ span: 3 } },
      wrapperCol: { sm:{ span: 6 }, xs:{ span: 18 }, md:{ span: 21 } },
    };

    return (
      <>
        <Form api={form} {...formItemLayout} colon data={currentItem} labelAlign="left">
          {/* 主表 */}
          <Card
            title={`${title[operate] || ''}字典信息`}
            extra={
              <Button
                loading={submitting}
                type="primary"
                onClick={() => this.handleSaveClick()}
                disabled={operate === '' || operate === 'view'}
              >
                保存
              </Button>
            }
          >
            <Row>
              <Col span={12}>
                <Select
                  label="所属分类"
                  keys={['id', 'name']}
                  data={options}
                  id="parentId"
                  rules={['required']}
                  disabled={operate === '' || operate === 'view'}
                />
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Input
                  label="字典编码"
                  id="code"
                  rules={['required']}
                  max={30}
                  msg="full"
                  disabled={operate === '' || operate === 'view'}
                />
              </Col>
              <Col span={12}>
                <Input
                  label="字典描述"
                  id="name"
                  rules={['required']}
                  max={30}
                  msg="full"
                  disabled={operate === '' || operate === 'view'}
                />
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
                  disabled={operate === '' || operate === 'view'}
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
