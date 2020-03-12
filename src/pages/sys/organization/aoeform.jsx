import React, { Component } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Row, Col, Modal, Switch, Tooltip, Form, Input, TreeSelect } from 'antd';
import { connect } from 'dva';

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

    const { modalType, currentItem, data, submitting } = that.props.organization;
    const title = { create: '新增', edit: '编辑' };

    currentItem.enable = currentItem.status === '0000'

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
        centered
        onOk={() => this.handleSaveClick()}
        title={`${title[modalType] || '查看'}部门信息`}
      >
        <Form initialValues={currentItem} {...formItemLayout} colon>
          <Form.Item name="name" label="部门名称" rules={[{required: true,}]}>
            <Input max={30} />
          </Form.Item>
          <Form.Item name="code"
                     label="部门编码"
                     validateTrigger="onBlur"
                     rules={[{
                              message: '编码格式错误,仅允许使用字母或数字.',
                              pattern: new RegExp(/^[a-zA-Z_0-9]{2,40}$/),
                            },
                            {
                              required: true,
                              whitespace: true,
                              validator: this.checkCode,
                            },
                          ]}>
            <Input max={40}/>
          </Form.Item>
          <Form.Item name="parentId"
                     label={
                      <span>
                        上级部门&nbsp;
                        <Tooltip title="留空为添加顶级部门">
                          <QuestionCircleOutlined />
                        </Tooltip>
                      </span>
                    }>
            <TreeSelect
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              data={data}
              keys={['id', 'name', 'children']}
              treeNodeFilterProp="name"
              treeDefaultExpandAll
              allowClear
              showSearch
              placeholder="请选择上级部门（留空为添加顶级部门）"
            />
          </Form.Item>
          <Row>
            <Col span={12}>
              <Form.Item label="显示顺序"
                          name="orders"
                          {...formRowOne}
                          rules={[{
                            type: 'number'
                          }]}>
                <Input max={5}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="是否启用"
                         name="enable"
                         valuePropName="checked"
                         {...formRowOne}>
                <Switch
                  checkedChildren="启用"
                  unCheckedChildren="停用"
                  defaultChecked={currentItem.status ? currentItem.status === '0000' : true}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注" name="remark">
            <Input.TextArea max={200} rows={4}/>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
