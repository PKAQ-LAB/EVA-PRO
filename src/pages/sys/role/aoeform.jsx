import React, { useState } from 'react';
import { useModel } from 'umi';
import { Form, Input, Row, Col, Modal, TreeSelect } from 'antd';
import DictSelector from '@/components/DictSelector';

import Http from '@/utils/http';
import API from '@/apis';

export default (props) => {
  const [ form ] = Form.useForm();
  const { initialState, setInitialState } = useModel('@@initialState');

  // eslint-disable-next-line prefer-destructuring
  const dict = initialState.dict;

  const [ orgs, setOrgs ] = useState([]);
  const [ showDepts, setShowDepts ] = useState(false);
  const [ submitting, setSubmitting ] = useState(false);

  const title = { create: '新增', edit: '编辑', view: '查看' };

  // 渲染界面
  const formItemLayout = {
    labelCol: { flex: '0 0 120px' },
    wrapperCol: { flex: 'auto' },
  };

  const { fetch, currentItem, modalType, setModalType } = props;

  React.useEffect(() => {
    if (currentItem.dataPermissionType) {
      currentItem.dataPermissionType = currentItem.dataPermissionType || '0000';
      if(currentItem.dataPermissionType === "0003"){
        Http.list(API.ORG_LIST).then((res) => {
          if(res.success) {
           setOrgs(res.data);
          }
        });
      }
    }

    if (currentItem.dataPermissionDeptid && typeof currentItem.dataPermissionDeptid === 'string') {
      currentItem.dataPermissionDeptid = currentItem.dataPermissionDeptid.split(',');
    }
  }, [currentItem]);

  // 校验角色编码唯一性
  // eslint-disable-next-line consistent-return
  const checkCode = async (rule, code) => {

    if (currentItem && currentItem.id && code === currentItem.code) {
      return Promise.resolve();
    }

    Http.post(API.ROLE_CHECKUNIQUE, {code}).then(r => {
      if (r.success) {
        return Promise.resolve();
      }
      return Promise.reject(r.message);
    })
  };

  // 数据权限
 const handleDataPermissionChange = v  => {
    if(v === "0003") {
      setShowDepts(true);
    } else {
      setShowDepts(false);
    }
    Http.list(API.ORG_LIST).then((res) => {
      if(res.success) {
       setOrgs(res.data);
      }
    });
  };

  // 保存
  const handleSaveClick = () => {
    const { validateFields } = form;

    validateFields().then( values => {
      const formData = { ...values };

      if (currentItem && currentItem.id) {
        formData.id = currentItem.id;
      }
      if (values.dataPermissionDeptid) {
        formData.dataPermissionDeptid = values.dataPermissionDeptid.join(',');
      }
      setSubmitting(true);
      Http.post(API.ROLE_SAVE,formData).then((res) => {
        if(res.success){
          setModalType("");
          fetch();
        }
      })
    }).finally(() => {
      setSubmitting(false);
    })
  };


    return (
      <Modal
        maskClosable={false}
        confirmLoading={submitting}
        onCancel={() => setModalType("")}
        open={modalType !== ''}
        width={700}
        centered
        onOk={() => handleSaveClick()}
        title={`${title[modalType] || ''}角色`}
      >
        <Form {...formItemLayout} colon initialValues={currentItem} form={form}>
          <Row>
            <Col span={12}>
              <Form.Item
                  label="角色名称"
                  name="name"
                  rules={[{required: true,}]}>
                <Input max={30} disabled={modalType === 'view'}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                  label="角色编码"
                  name="code"
                  validateTrigger="onBlur"
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: '仅允许使用(4-30位)字母或数字.',
                      whitespace: true,
                      pattern: /^[0-9a-zA-Z_]{4,30}$/,
                    },
                    {
                      validator: checkCode,
                    }
                  ]}>
                <Input min={4} max={30} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="角色描述"
                     name="remark">
            <Input.TextArea max={60} />
          </Form.Item>

          <Form.Item label="数据权限"
                     name="dataPermissionType"
                     rules={[{required: true,}]}>
            <DictSelector
              data={dict.data_permission}
              onChange={(v) => handleDataPermissionChange(v)}
            />
          </Form.Item>

          {(showDepts || currentItem.dataPermissionType === '0003') && (
             <Form.Item label="选择部门"
                        name="dataPermissionDeptid">
              <TreeSelect
                treeData={orgs}
                treeCheckable
                allowClear
                multiple
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
}
