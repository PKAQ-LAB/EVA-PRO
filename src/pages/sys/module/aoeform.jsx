import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Input, Row, Col, Switch, Drawer, Button, Tooltip } from 'antd';
import TreeSelector from '@/components/TreeSelector';
import IconSelect from '@/components/IconSelect';

import LineList from './linelist';

import Http from '@/utils/http';
import API from '@/apis';

export default (props) => {
  const { fetch, operateType, data, setOperateType, currentItem } = props;

  const [ submitting, setSubmitting ] = React.useState(false);
  const [ lineData, setLineData ] = React.useState(currentItem.resources);
  const lineProps = { lineData, setLineData  };

  const title = { create: '新增', edit: '编辑' };
  const [ form ] = Form.useForm();

  const formItemLayout = {
    labelCol: { flex: '0 0 100px' },
    wrapperCol: { flex: 'auto' },
  };

  const formInit = {
    ...currentItem,
    status: currentItem.status ? currentItem.status === '0000' : true
  }

  // 校验路径唯一性
  // eslint-disable-next-line consistent-return
  const checkPath = async (rule, value) => {
    const { getFieldValue } = form;
    const path = getFieldValue('path');

    const parentId = getFieldValue('parentId');
    const fd = { id: currentItem.id, path, parentId };

    await Http.post(API.MODULE_CHECKUNIQUE, fd).then(r => {
      if (r.success) {
        return Promise.resolve();
      }
      return Promise.reject(r.message);
    })
  };

  // 保存
  const handleSaveClick = () => {
    const { validateFields } = form;
    // 对校验过的表单域 再进行一次强制表单校验
    setSubmitting(true);
    validateFields().then(values => {
      const fd = {
        ...values,
        id: currentItem.id,
      };

      fd.resources = lineData;
      fd.status = fd.status ? '0000' : '0001';
      Http.post(API.MODULE_EDIT, fd).then((r) =>{
        setSubmitting(false);
        if(r.success){
          setOperateType("")
          fetch();
        }
      });
    }).catch(() =>{
      setSubmitting(false);
    })
  };

  return (
    <Drawer
      width={ 640}
      maskClosable={false}
      onClose={() => setOperateType("")}
      open={operateType !== ''}
      title={`${title[operateType] || '查看'}模块信息`}
    >
      <Form initialValues={formInit} form={form} {...formItemLayout} colon>
        <Form.Item
                label="模块名称"
                name="name"
                rules={[{required: true,max: 30, min: 2}]}>
          <Input max={30} />
        </Form.Item>

        <Form.Item
                label="Path"
                name="path"
                validateTrigger= "onBlur"
                rules={[{
                  max: 40,
                  min: 5,
                  required: true,
                  whitespace: true,
                  validator: checkPath,
                  message: '路径格式错误, 必须以‘/’开头，仅允许使用字母或数字.',
                  pattern: new RegExp(/^\/[a-zA-Z_]*[/a-zA-Z_0-9]{2,40}$/),
                }]}>
          <Input max={40}/>
        </Form.Item>

        <Form.Item
                label="模块图标"
                name="icon"
                rules={[{required: true}]}>
          <IconSelect width={480} />
        </Form.Item>

        <Form.Item
          label={
            <span>
              上级模块&nbsp;
              <Tooltip title="留空为添加顶级模块">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          name="parentId">
          <TreeSelector
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            data={data}
            keys={['id', 'name', 'children']}
            treeDefaultExpandAll
            allowClear
            showSearch
            placeholder="请选择上级模块（留空为添加顶级模块）"
          />
        </Form.Item>

        <Row>
          <Col span={12}>
            <Form.Item
                label="显示顺序"
                name="orders"
                rules={[{required: true,max: 5}]}>
              <Input max={5}  />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
                label="是否启用"
                valuePropName="checked"
                name="status">
              <Switch
                checkedChildren="启用"
                unCheckedChildren="停用"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
                label="备注"
                name="remark"
                rules={[{max: 200}]}>
          <Input.TextArea max={200} />
        </Form.Item>
      </Form>

      <LineList {...lineProps} />

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
        <Button onClick={() => setOperateType("")} style={{ marginRight: 8 }} loading={submitting}>
          取消
        </Button>
        <Button onClick={() => handleSaveClick()} type="primary" loading={submitting}>
          保存
        </Button>
      </div>
    </Drawer>
  );
}
