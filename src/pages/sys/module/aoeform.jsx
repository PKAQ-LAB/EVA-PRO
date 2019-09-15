import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Modal, Switch } from 'antd';
import { Form, Input, TreeSelect } from 'antx';

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
      data.status = data.status ? '0000' : '0001';
      this.props.dispatch({
        type: 'module/save',
        payload: data,
      });
    });
  };

  // 渲染界面
  render() {
    const { submitting, form } = this.props;
    const { modalType, currentItem, data } = this.props.module;
    const title = { create: '新增', edit: '编辑' };

    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 17 },
    };

    const formRowOne = {
      labelCol: { span: 10 },
      wrapperCol: { span: 12 },
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
        <Form api={form} data={currentItem} {...formItemLayout} colon>
          <Input label="模块名称" id="name" rules={['required']} max={30} msg="full" />

          <Input
            label="Path"
            id="path"
            rules={[
              {
                required: true,
                message: '路径格式错误或已存在',
                whitespace: true,
                pattern: /^[0-9a-zA-Z_]{4,16}$/,
                validator: this.checkPath,
              },
            ]}
            validateTrigger="onBlur"
            max={40}
            msg="full"
          />

          <Input label="模块图标" id="icon" rules={['string']} max={16} msg="full" />

          <TreeSelect
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            data={data}
            keys={['id', 'name', 'children']}
            treeNodeFilterProp="name"
            expandAll
            allowClear
            showSearch
            id="parentId"
            label="上级模块"
            msg="full"
          />

          <Row>
            <Col span={12}>
              <Input
                label="显示顺序"
                id="orders"
                rules={['number']}
                max={5}
                msg=""
                {...formRowOne}
              />
            </Col>
            <Col span={12}>
              <Switch
                id="status"
                checkedChildren="启用"
                unCheckedChildren="停用"
                checked={currentItem.status === '0000'}
                label="是否启用"
                {...formRowOne}
              />
            </Col>
          </Row>

          <Input textarea label="备注" id="remark" rules={['max=200']} max={200} msg="full" />
        </Form>
      </Modal>
    );
  }
}
