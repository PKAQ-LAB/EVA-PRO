import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Switch, Drawer, Button, Tooltip, Icon } from 'antd';
import { Form, Input, TreeSelect } from 'antx';
import IconSelect from '@src/components/IconSelect';

import LineList from './linelist';

@Form.create()
@connect(state => ({
  module: state.module,
  submitting: state.loading.effects['module/save'],
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
    const { currentItem } = this.props.module;
    const data = { id: currentItem.id, path, parentId };
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
    const { currentItem, lineData } = this.props.module;
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

      data.resources = lineData;
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
      wrapperCol: { span: 19 },
    };

    const formRowOne = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };

    return (
      <Drawer
        width={640}
        maskClosable={false}
        onClose={() => this.handleCloseForm()}
        visible={modalType !== ''}
        title={`${title[modalType] || '查看'}模块信息`}
      >
        <Form api={form} data={currentItem} {...formItemLayout} colon>
          <Input label="模块名称" id="name" rules={['required']} max={30} msg="full" />

          <Input
            label="Path"
            id="path"
            rules={[
              {
                message: '路径格式错误, 必须以‘/’开头，仅允许使用字母或数字.',
                pattern: new RegExp(/^\/[a-zA-Z_]*[/a-zA-Z_0-9]{2,40}$/),
              },
              {
                required: true,
                whitespace: true,
                validator: this.checkPath,
              },
            ]}
            validateTrigger="onBlur"
            max={40}
            msg="full"
          />

          <IconSelect label="模块图标" id="icon" width={480} />

          <TreeSelect
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            data={data}
            keys={['id', 'name', 'children']}
            treeNodeFilterProp="name"
            expandAll
            allowClear
            showSearch
            id="parentId"
            label={
              <span>
                上级模块&nbsp;
                <Tooltip title="留空为添加顶级模块">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }
            msg="请选择上级模块（留空为添加顶级模块）"
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
                initialValue={currentItem.status ? currentItem.status === '0000' : true}
                defaultChecked={currentItem.status ? currentItem.status === '0000' : true}
                label="是否启用"
                {...formRowOne}
              />
            </Col>
          </Row>

          <Input textarea label="备注" id="remark" rules={['max=200']} max={200} msg="full" />
        </Form>

        <LineList />

        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <Button onClick={this.handleCloseForm} style={{ marginRight: 8 }} loading={submitting}>
            取消
          </Button>
          <Button onClick={this.handleSaveClick} type="primary" loading={submitting}>
            保存
          </Button>
        </div>
      </Drawer>
    );
  }
}
