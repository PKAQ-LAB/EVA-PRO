import React, { PureComponent } from 'react';
import { Row, Col, Form, Input, Select } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create()
export default class AOEForm extends PureComponent {
  // 渲染界面
  render() {
    const { getFieldDecorator } = this.props.form;
    const { currentItem } = this.props.form;

    const formItem = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };

    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 8 },
    };

    const formGrid = {
      labelCol: { span: 2 },
      wrapperCol: { span: 20 },
    };

    const formGridLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };

    return (
      <Form style={{ padding: '0 35px' }}>
        {/* 第一行 */}
        <FormItem label="名称:" labelAlign="left" {...formItemLayout}>
          {getFieldDecorator('title', {
            // initialValue: currentItem.title,
          })(<Input placeholder="请输入模块名称" />)}
        </FormItem>
        {/* 第二行 */}
        <FormItem label="描述:" labelAlign="left" {...formGrid}>
          {getFieldDecorator('description', {
            // initialValue: currentItem.description,
          })(<Input placeholder="请输入模块描述" />)}
        </FormItem>
        {/* 第三行 */}
        <Row>
          <Col span={12}>
            <FormItem label="Project Name:" labelAlign="left" {...formItem}>
              {getFieldDecorator('projectName', {
                // initialValue: currentItem.projectName,
              })(<Input style={{ width: '80%' }} placeholder="请输入项目名称（英文）" />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="Module Name:" labelAlign="left" {...formItem}>
              {getFieldDecorator('moduleName', {
                // initialValue: currentItem.moduleName,
              })(<Input style={{ width: '80%' }} placeholder="请输入模块名（英文）" />)}
            </FormItem>
          </Col>
        </Row>
        {/* 第四行 */}
        <FormItem label="Package Name:" labelAlign="left" {...formGrid}>
          {getFieldDecorator('packageName', {
            // initialValue: currentItem.packageName,
          })(<Input placeholder="请输入后台包名" />)}
        </FormItem>
        {/* 第五行 */}
        <FormItem label="ORM选型:" labelAlign="left" {...formItemLayout}>
          {getFieldDecorator('orm', {
            initialValue: currentItem && currentItem.orm ? currentItem.orm : 'jpa',
          })(
            <Select style={{ width: '100%' }}>
              <Option key="jpa" value="jpa">
                JPA
              </Option>
              <Option key="mybatis" value="mybatis">
                Mybatis
              </Option>
            </Select>,
          )}
        </FormItem>
        {/* 第六行 */}
        <Row>
          <Col span={12}>
            <FormItem label="是否分页:" labelAlign="left" {...formGridLayout}>
              {getFieldDecorator('pageable', {
                initialValue: currentItem && currentItem.pageable ? currentItem.pageable : '0',
              })(
                <Select style={{ width: '100%' }}>
                  <Option value="0">是</Option>
                  <Option value="1">否</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="是否多选:" labelAlign="left" {...formGridLayout}>
              {getFieldDecorator('selection', {
                initialValue: currentItem && currentItem.selection ? currentItem.selection : '0',
              })(
                <Select style={{ width: '100%' }}>
                  <Option value="0">是</Option>
                  <Option value="1">否</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
        </Row>
        {/* 第七行 */}
        <FormItem label="界面模型:" labelAlign="left" {...formItemLayout}>
          {getFieldDecorator('ui', {
            // initialValue: currentItem.ui,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">列表弹窗（单表）</Option>
              <Option value="1">卡片弹窗（单表）</Option>
              <Option value="2">列表Tab（单表）</Option>
              <Option value="3">树结构（单表）</Option>
              <Option value="4">列表侧滑（单表）</Option>
              <Option value="5">主子表Tab（多表）</Option>
            </Select>,
          )}
        </FormItem>
      </Form>
    );
  }
}
