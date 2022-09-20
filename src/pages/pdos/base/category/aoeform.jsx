import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Row, Col, Modal, Switch, Tooltip, Form, Input, TreeSelect } from 'antd';

import Service from '@/services/service';
import API from '@/apis';

export default (props) => {

  const [form] = Form.useForm();
  const [ submitting, setSubmitting ] = React.useState(false);
  const { data, fetch, operateType, setOperateType, currentItem } = props;
  const title = { create: '新增', edit: '编辑' };

  const initValues = {
    ...currentItem,
    enable: currentItem.status ? currentItem.status === '0001' : true
  }

  // 渲染界面
  const formItemLayout = {
    labelCol: { flex: '0 0 100px' },
    wrapperCol: { flex: 'auto' },
  };

  // 校验编码唯一性
  // eslint-disable-next-line consistent-return
  const checkCode = async (rule, value) => {
    const { getFieldValue } = form;

    const code = getFieldValue('code');

    if (currentItem && currentItem.id && value === currentItem.code) {
      return Promise.resolve();
    }
    await Service.post(API.CATEGORY_CHECKUNIQUE, {code}).then((r)=>{
      if (r.success) {
        return Promise.resolve();
      }
      return Promise.reject(r.message);
    });
  };

  // 保存
  const handleSaveClick = () => {
    const { validateFields } = form;
    validateFields().then(values => {
      const formData = {
        ...values,
        id: currentItem.id,
      };

      setSubmitting(true);

      formData.status = formData.enable ? '0001' : '0000';

      Service.post(API.CATEGORY_EDIT, formData).then((r) => {
        setSubmitting(false);
        if(r.success){
          setOperateType("");
          fetch();
        }
      });
    });
  };

  return (
    <Modal
      maskClosable={false}
      confirmLoading={submitting}
      onCancel={() => setOperateType("")}
      visible={operateType !== ''}
      width={700}
      centered
      onOk={() => handleSaveClick()}
      title={`${title[operateType] || '查看'}部门信息`}
    >
      <Form initialValues={initValues} {...formItemLayout} colon form={form}  labelAlign = "left">
        <Form.Item name="name" label="部门名称" rules={[{required: true,}]}>
          <Input max={30} />
        </Form.Item>
        <Form.Item name="code"
                    label="部门编码"
                    validateTrigger="onBlur"
                    hasFeedback
                    rules={[{
                            message: '编码格式错误,仅允许使用字母或数字.',
                            pattern: new RegExp(/^[a-zA-Z_0-9]{2,40}$/),
                            required: true,
                            whitespace: true,
                            validator: checkCode,
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
            treeData={data}
            keys={['id', 'name', 'children']}
            treeNodeFilterProp="name"
            treeDefaultExpandAll
            allowClear
            showSearch
            placeholder="请选择上级部门（留空为添加顶级部门）"
          />
        </Form.Item>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="显示顺序"
                        name="orders">
              <Input max={5}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="是否启用"
                        name="enable"
                        valuePropName="checked">
              <Switch
                checkedChildren="启用"
                unCheckedChildren="停用"
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
