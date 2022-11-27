import React, { useState, useRef } from 'react';
import { useModel } from 'umi';
import moment from 'moment';
import { Select, Spin,Drawer, Button, Form, Input, InputNumber, Row, Col, DatePicker, Divider } from 'antd';
import { EditableProTable, ProCard, ProFormField } from '@ant-design/pro-components'
import * as math from 'mathjs';
import DictSelector from '@/components/DictSelector'
import DebounSelector from '@/components/DebounSelector';
import Selector from '@/components/Selector';

import Http from '@/utils/http';
import API from '@/services/apis';

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

  const [value, setValue] = useState([]);
  const defaultData = currentItem?.lines || new Array(1).fill(1).map( (_,index) => {
    return {id: (Date.now() + index).toString(),}
  });

  const [editableKeys, setEditableRowKeys] = useState(() =>
    defaultData.map((item) => item.id),
  );

  const [dataSource, setDataSource] = useState(() => defaultData);

  const fetchGoodsList = async (param,r) => {
    return Http.list(API.GOODS_LISTALL,{itemNo:param})
               .then(res => {
                return res.data
                          .map((item) => ({
                            label: `[${item.itemNo}] - ${item.brandName} ${item.name}`,
                            value: item.id
                       }))
            });
  }


  // 校验编码唯一性
  // eslint-disable-next-line consistent-return
  const checkCode = async (rule, value) => {
    const { getFieldValue } = form;

    const code = getFieldValue('orderNumber');

    if (currentItem && currentItem.id && value === currentItem.code) {
      return Promise.resolve();
    }
    await Http.post(API.ORDER_CHECKCODE, {code}).then((r)=>{
      if (r.success) {
        return Promise.resolve();
      }
      return Promise.reject(r.message);
    });
  };

  const columns = [
    {
      title: '商品',
      dataIndex: 'goodsId',
      width: 160,
      renderFormItem: (_,r) =>{
        return <DebounSelector
                  placeholder="货号查找"
                  fetchOptions={(v) => fetchGoodsList(v, r)}
                  style={{ width: '100%' }}
                />
      }
    },{
      title: '数量',
      dataIndex: 'dealNum',
      width: 80,
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
      width: 80,
      dataIndex: 'notaxValue',
    },{
      title: '优惠金额',
      width: 80,
      dataIndex: 'discount',
    },{
      title: '成交价',
      width: 80,
      dataIndex: 'dealPrice',
    },{
      title: '成交金额',
      width: 80,
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
    currentItem.orderDate = moment(currentItem.orderDate) || moment();

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
            <Form.Item label="订单状态" name="orderStatus">
              <DictSelector
                placeholder="订单状态"
                readOnly={ readOnly }
                data={dict?.order_status}/>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="来源平台" name="platform">
            <DictSelector
                placeholder="来源平台"
                readOnly={ readOnly }
                data={dict?.online_platform}/>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="来源店铺" name="shopId">
              <Selector
                  readOnly = {readOnly}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  url="/api/pdos/base/shop/listAll"
                  k="id"
                  v="name"
                  clear
                  showSearch
                />
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
        <Row gutter={24}>
          <Col span={24}>
            <EditableProTable
              editableFormRef={editorFormRef}
              className={style.lines}
              columns={columns}
              size="small"
              rowKey="id"
              scroll={{ x: '100vw' }}
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
          </Col>
        </Row>
      </Form>
    )
  }

  return (
    <Drawer
      title={`${title[operateType] || '查看'}销售单数据`}
      width="70%"
      destroyOnClose
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
