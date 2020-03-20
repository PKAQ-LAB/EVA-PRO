import React from 'react';
import { connect } from 'umi';
import { Form, Input, Select, Card, Row, Col, Button } from 'antd';
import LineList from './linelist';


@connect(state => ({
  dict: state.dict,
  submitting: state.loading.effects['dict/editDict'],
}))
export default class DictForm extends React.PureComponent {
  formRef = React.createRef();

  // 保存事件
  handleSaveClick = () => {
    const { lineData, currentItem } = this.props.dict;

    const { validateFields } = this.formRef.current;

    validateFields().then(values => {
      const data = {
        ...values,
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
    })
  };

  render() {
    const { submitting } = this.props;
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
        <Form  {...formItemLayout} colon initialValues={currentItem} ref={this.formRef}>
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
              <Form.Item
                  label="所属分类"
                  name="parentId"
                  rules={[{required: true,}]}>
                  <Select
                    keys={['id', 'name']}
                    data={options}
                    disabled={operate === '' || operate === 'view'}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label="字典编码"
                  name="code"
                  rules={[{required: true,}]}>
                  <Input
                    max={30}
                    disabled={operate === '' || operate === 'view'}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="字典描述"
                  name="name"
                  rules={[{required: true,}]}>
                  <Input
                    max={30}
                    disabled={operate === '' || operate === 'view'}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                    label="备注"
                    {...formRowOne}
                    name="remark">
                  <Input.TextArea
                    max={200}
                    disabled={operate === '' || operate === 'view'}
                    rows={5}
                  />
                  </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
        <LineList />
      </>
    );
  }
}
