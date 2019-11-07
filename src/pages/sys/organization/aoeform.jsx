import React, { Component } from 'react';
import { Row, Col, Modal, Switch, Tooltip, Icon } from 'antd';
import { Form, Input, TreeSelect } from 'antx';
import { connect } from 'dva';

@Form.create()
@connect(state => ({
  organization: state.organization,
  submitting: state.loading.effects['organization/save'],
}))
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
  // eslint-disable-next-line consistent-return
  checkCode = (rule, value, callback) => {
    const that = this;
    const { getFieldValue } = that.props.form;

    const code = getFieldValue('code');

    const { currentItem } = this.props.organization;
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
        if (r && r.success) {
          return callback();
        }
        return callback('该编码已存在');
      });
  };

  // 保存
  handleSaveClick = () => {
    const that = this;

    const { currentItem } = that.props.organization;
    const { getFieldsValue, validateFields } = that.props.form;
    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
        id: currentItem.id,
      };

      data.status = data.enable ? '0000' : '0001';
      this.props.dispatch({
        type: 'organization/save',
        payload: data,
      });
    });
  };

  // 渲染界面
  render() {
    const that = this;

    const { form } = that.props;
    const { modalType, currentItem, data, submitting } = that.props.organization;
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
        confirmLoading={submitting}
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={600}
        onOk={() => this.handleSaveClick()}
        title={`${title[modalType] || '查看'}部门信息`}
      >
        <Form api={form} data={currentItem} {...formItemLayout} colon>
          <Input label="部门名称" id="name" rules={['required']} max={30} msg="full" />

          <Input
            label="部门编码"
            id="code"
            rules={[
              {
                message: '编码格式错误,仅允许使用字母或数字.',
                pattern: new RegExp(/^[a-zA-Z_0-9]{2,40}$/),
              },
              {
                required: true,
                whitespace: true,
                validator: this.checkCode,
              },
            ]}
            validateTrigger="onBlur"
            max={40}
            msg="full"
          />

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
                上级部门&nbsp;
                <Tooltip title="留空为添加顶级部门">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }
            msg="请选择上级部门（留空为添加顶级部门）"
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
                id="enable"
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
      </Modal>
    );
  }
}
