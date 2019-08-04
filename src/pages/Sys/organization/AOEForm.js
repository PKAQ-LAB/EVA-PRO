import React, { Component } from 'react';
import { Row, Col, Form, Input, InputNumber, Modal, Switch, TreeSelect } from 'antd';

const FormItem = Form.Item;
const Area = Input.TextArea;
const TreeNode = TreeSelect.TreeNode;

@Form.create()
export default class AOEForm extends Component {
  // 关闭窗口
  handleCloseForm = () => {
    const that = this;
    that.props.dispatch({
      type: 'organization/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 校验编码唯一性
  checkCode = (rule, value, callback) => {
    const that = this;
    const { getFieldValue } = that.props.form;

    const code = getFieldValue('code');
    const { currentItem } = this.props;
    if (currentItem && currentItem.id && value === currentItem.code) {
      return callback();
    }
    const data = { code };
    that.props
      .dispatch({
        type: 'organization/checkUnique',
        payload: data,
      })
      .then(r => {
        if (r.success) {
          return callback();
        }
          return callback('该编码已存在');
      });

  };

  // 渲染树节点 - 剔除状态为停用状态(0000)得节点
  renderTreeNodes = data => {
    const { currentItem } = this.props;
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
      .filter(item => (item || false));
  };

  // 保存
  handleSaveClick = () => {
    const that = this;

    const { dispatch, currentItem } = that.props;
    const { getFieldsValue, validateFields } = that.props.form;
    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
        id: currentItem.id,
      };
      data.status = data.status ? '0001' : '0000';
      dispatch({
        type: 'organization/save',
        payload: data,
      });
    });
  };

  // 渲染界面
  render() {
    const that = this;

    const { getFieldDecorator } = that.props.form;
    const { modalType, currentItem, data, submitting } = that.props;

    const cmView = modalType === 'view';

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
        confirmLoading={submitting}
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={600}
        onOk={() => this.handleSaveClick()}
        title={
          modalType === 'create'
            ? '新增组织信息'
            : modalType === 'edit'? '编辑组织信息': '查看组织信息'
        }
      >
        <Form>
          {/* 第一行 */}
          <Row>
            <Col span={12}>
              <FormItem label="名称" hasFeedback {...formItemLayout}>
                {getFieldDecorator('name', {
                  initialValue: currentItem.name,
                  rules: [{ required: true, message: '请输入组织名称' }],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="编码" hasFeedback {...formItemLayout}>
                {getFieldDecorator('code', {
                  initialValue: currentItem.code,
                  validateTrigger: 'onBlur',
                  rules: [{ required: true, pattern: /^[0-9a-zA-Z_]{1,}$/, message: '请输入编码' }, { validator: this.checkCode }],
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
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
                treeNodeFilterProp="name"
                treeNodeLabelProp="pathName"
                placeholder="请选择上级节点"
              >
                <TreeNode title="根节点" pathName="根节点" key="0" value="0" />
                {this.renderTreeNodes(data)}
              </TreeSelect>
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
                      message: '请输入编码',
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
          {/* 第五行 */}
          {cmView && (
            <Row>
              <Col span={12}>
                <FormItem label="创建人" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="创建时间" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
            </Row>
          )}
          {/* 第六行 */}
          {cmView && (
            <Row>
              <Col span={12}>
                <FormItem label="修改人" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="修改时间" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>
    );
  }
}
