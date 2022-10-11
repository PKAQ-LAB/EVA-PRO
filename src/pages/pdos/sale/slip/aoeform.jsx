import React, { useState, useRef } from 'react';
import { useModel } from 'umi';
import moment from 'moment';
import { Drawer, Button, Form, Input, InputNumber, Row, Col, DatePicker, Divider } from 'antd';
import { EditableProTable, ProCard, ProFormField } from '@ant-design/pro-components'
import * as math from 'mathjs';
import DictSelector from '@/components/DictSelector'

import Http from '@/utils/http';
import API from '@/apis';

import style from './index.less';

export default (props) => {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const formRef = useRef();
  const editorFormRef = useRef();

  const dict = initialState.dict;

  const title = { create: '新增', edit: '编辑' };
  const { operateType, setOperateType, currentItem, fetch } = props;

  const formItemLayout = {
    labelCol: { flex: "0 0 90px" },
    wrapperCol: { flex: "auto" },
  };


  const defaultData = currentItem?.lines || [];

  const [editableKeys, setEditableRowKeys] = useState(() =>
    defaultData.map((item) => item.id),
  );

  const [dataSource, setDataSource] = useState(() => defaultData);

  const columns = [
    {
      title: '商品',
      dataIndex: 'cargoName',
      width: '30%',
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: '此项是必填项',
          }
        ],
      },
    },{
      title: '货号',
      dataIndex: 'cargoCode'
    },{
      title: '数量',
      dataIndex: 'dealNum',
      formItemProps: {
        rules: [{
            required: true,
            whitespace: true,
            message: '此项是必填项',
          },{
            message: '必须包含数字',
            pattern: /[0-9]/,
          }],
      },
    },{
      title: '单价',
      dataIndex: 'notaxValue',
    },{
      title: '优惠金额',
      dataIndex: 'discount',
    },{
      title: '成交价',
      dataIndex: 'dealPrice',
    },{
      title: '成交金额',
      dataIndex: 'amount',
    },{
      title: '操作',
      valueType: 'option',
      width: 250,
      render: () => {
        return null;
      },
    },
  ];

  // 保存
  const handleSaveClick = () => {
    const { validateFields } = form;

    setLoading(true);
    validateFields().then(values => {

      const rows = editorFormRef.current?.getRowsData?.();
      values.orderDate = moment(values.orderDate).format('YYYY-MM-DD HH:mm:ss')

      const formData = {
        ...values,
        id: currentItem ? currentItem.id : '',
        lines: rows
      };


      Http.post(API.ORDER_EDIT, formData).then((r) => {
        fetch();
        setOperateType("")
      })
    }).finally(() => {
      setLoading(false);
    });
  };

  const readOnly = operateType === 'view';
  // 表单渲染
  const renderForm = () => {
    currentItem.dealTime = moment(currentItem.dealTime) || moment();
    return (
      <Form size="middle" {...formItemLayout} labelAlign="left" form={form} initialValues={currentItem} ref={formRef}>
        <fieldset>
          <legend>基本信息</legend>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="订单时间" name="orderDate">
                <DatePicker showTime showToday readOnly={readOnly} style={{width: '100%'}}/>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="订单号" name="orderNumber">
                <Input readOnly={readOnly} style={{width: '100%'}}/>
              </Form.Item>
            </Col>
          </Row>
        </fieldset>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="订单状态" name="orderCode">
              <DictSelector
                placeholder="订单状态"
                readOnly={ readOnly }
                data={dict?.order_status}/>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="来源店铺" name="goodsName">
            <DictSelector
                placeholder="来源店铺"
                readOnly={ readOnly }
                data={dict?.online_platform}/>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
         <Col span={8}>
            <Form.Item label="合计数量" name="totalNum">
              <InputNumber controls={false} readOnly={readOnly} style={{width: '100%'}} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="合计金额" name="totalAmount">
              <InputNumber controls={false} readOnly={readOnly} style={{width: '100%'}}/>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="收货地址" name="buyerAddress">
              <Input.TextArea rows={2} readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>

        <EditableProTable
          editableFormRef={editorFormRef}
          className={style.lines}
          columns={columns}
          rowKey="id"
          scroll={{ x: 960 }}
          value={dataSource}
          onChange={setDataSource}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            record: () => ({
              id: Date.now(),
            }),
          }}
          editable={{
            type: 'multiple',
            editableKeys,
            actionRender: (row, config, defaultDoms) => {
              return [defaultDoms.delete];
            },
            onValuesChange: (record, recordList) => {
              setDataSource(recordList);
            },
            onChange: setEditableRowKeys,
          }}
        />
      </Form>
    )
  }

  return (
    <Drawer
      title={`${title[operateType] || '查看'}销售单数据`}
      width="70%"
      onClose={() => setOperateType("")}
      open={operateType !== ''}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <Button
            loading={loading}
            onClick={() => setOperateType("")}
            style={{ marginRight: 8 }}
          >
            关闭
          </Button>
          <Button loading={loading} onClick={() => handleSaveClick()} type="primary">
            提交
          </Button>
        </div>
      }
    >
      {renderForm()}
    </Drawer>
  );
}
