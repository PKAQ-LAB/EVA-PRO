import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Form, Input, InputNumber, Modal, Switch, TreeSelect } from 'antd';

const FormItem = Form.Item;
const Area = Input.TextArea;
const { TreeNode } = TreeSelect;

@Form.create()
@connect(state => ({
  module: state.module,
  submitting: state.loading.effects['account/save'],
}))
export default class AOEForm extends Component {
  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'module/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 校验路径唯一性
  // eslint-disable-next-line consistent-return
  checkPath = (re, value, callback) => {
    const { getFieldValue } = this.props.form;
    const that = this;
    const path = getFieldValue('path');
    const parentId = getFieldValue('parentId');
    const { currentItem } = this.props;
    if (currentItem && currentItem.id && value === currentItem.path) {
      return callback();
    }
    const data = { path, parentId };
    that.props
      .dispatch({
        type: 'module/checkUnique',
        payload: data,
      })
      .then(r => {
        if (r && r.success) {
          return callback();
        }
        return callback('该路径已存在');
      });
  };

  // 渲染树节点 - 剔除状态为停用状态(0000)得节点
  renderTreeNodes = data => {
    const { currentItem } = this.props.module;
    return data
      .map(item => {
        if (item.status === '0001' && item.id !== currentItem.id) {
          if (item.children) {
            return (
              <TreeNode
                title={item.name}
                pathName={item.pathName ? item.pathName : item.name}
                key={item.id}
                value={item.id}
              >
                {this.renderTreeNodes(item.children)}
              </TreeNode>
            );
          }
          return (
            <TreeNode
              title={item.name}
              pathName={item.pathName ? item.pathName : item.name}
              key={item.id}
              value={item.id}
            />
          );
        }
        return null;
      })
      .filter(item => item || false);
  };

  // 保存
  handleSaveClick = () => {
    const { currentItem } = this.props.module;
    const { getFieldsValue, validateFields } = this.props.form;
    // 对校验过的表单域 再进行一次强制表单校验
    validateFields({ force: true }, errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
        id: currentItem.id,
      };
      data.status = data.status ? '0001' : '0000';
      this.dispatch({
        type: 'module/save',
        payload: data,
      });
    });
  };

  // 渲染界面
  render() {
    const { submitting } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { modalType, currentItem, data } = this.props.module;
    const title = { create: '新增', edit: '编辑' };

    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };
    const formRowOne = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19 },
    };

    return (
      <Modal
        maskClosable={false}
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={600}
        confirmLoading={submitting}
        onOk={() => this.handleSaveClick()}
        title={`${title[modalType] || '查看'}模块信息`}
      >
        <Form>
          {/* 第一行 */}
          <FormItem label="名称" hasFeedback {...formRowOne}>
            {getFieldDecorator('name', {
              initialValue: currentItem.name,
              rules: [{ required: true, message: '请输入模块名称' }],
            })(<Input />)}
          </FormItem>
          <FormItem label="path" hasFeedback {...formRowOne}>
            {getFieldDecorator('path', {
              initialValue: currentItem.path,
              validateTrigger: 'onBlur',
              rules: [{ required: true, message: '请输入path' }, { validator: this.checkPath }],
            })(<Input />)}
          </FormItem>
          <FormItem label="icon" hasFeedback {...formRowOne}>
            {getFieldDecorator('icon', {
              initialValue: currentItem.icon,
              rules: [
                {
                  message: '模块图标',
                },
              ],
            })(<Input />)}
          </FormItem>
          {/* 第二行 */}
          <FormItem label="上级节点" hasFeedback {...formRowOne}>
            {getFieldDecorator('parentId', {
              initialValue: currentItem.parentId,
            })(
              <TreeSelect
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                showCheckedStrategy={TreeSelect.SHOW_ALL}
                allowClear
                showSearch
                treeNodeFilterProp="title"
                treeNodeLabelProp="pathName"
                placeholder="请选择上级节点"
              >
                <TreeNode title="根节点" pathName="根节点" key="0" value="0" />
                {this.renderTreeNodes(data)}
              </TreeSelect>,
            )}
          </FormItem>
          {/* 第三行 */}
          <Row>
            <Col span={12}>
              <FormItem label="排序" hasFeedback {...formItemLayout}>
                {getFieldDecorator('orders', {
                  initialValue: currentItem.orders,
                  rules: [
                    {
                      type: 'number',
                      message: '显示顺序',
                    },
                  ],
                })(<InputNumber />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="是否启用" {...formItemLayout}>
                {getFieldDecorator('status', {
                  valuePropName: 'checked',
                  initialValue: currentItem.status !== '0000',
                })(<Switch checkedChildren="启用" unCheckedChildren="停用" />)}
              </FormItem>
            </Col>
          </Row>
          {/* 第四行 */}
          <FormItem label="备注" hasFeedback {...formRowOne}>
            {getFieldDecorator('remark', {
              initialValue: currentItem.remark,
              rules: [
                {
                  message: '请输入备注',
                },
              ],
            })(<Area />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
