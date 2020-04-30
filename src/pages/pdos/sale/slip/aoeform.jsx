import React, { useState } from 'react';
import { useSelector } from 'umi';
import moment from 'moment';
import { Drawer, Button, Form, Input, Row, Col, DatePicker, Divider } from 'antd';
import * as math from 'mathjs';
import Selector from '@/components/Selector'
import DictSelector from '@/components/DictSelector'
import { editSlip } from './services/slipSvc';

export default (props) => {

  const [ form ] = Form.useForm();
  const [ loading, setLoading ] = useState(false);
  const dict = useSelector(state => state.global.dict);

  const title = { create: '新增', edit: '编辑' };
  const { operateType, setOperateType, currentItem, fetch  } = props;

  const formItemLayout = {
    labelCol: { flex: "0 0 90px" },
    wrapperCol: { flex: "auto" },
  };

  // 保存
  const handleSaveClick = () => {
    const { validateFields } = form;

    setLoading(true);
    validateFields().then(values => {

      const data = {
        ...values,
        id: currentItem ? currentItem.id : '',
      };
      data.dealTime = moment(data.dealTime).format("YYYY-MM-DD hh:mm:ss");

      editSlip(data).then(() => {
        fetch();
        setOperateType("")
      })
    }).finally(() => {
      setLoading(false);
    });
  };

  // 表单渲染
  const renderForm = () => {
    currentItem.dealTime = moment(currentItem.dealTime) || moment();
    return (
      <Form size="middle" {...formItemLayout} labelAlign="left" form={form} initialValues={currentItem}>
        <fieldset>
          <legend>商品信息</legend>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="商品名称" name="goodsName">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="货号" name="itemNo">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>
        </fieldset>

        <fieldset>
          <legend>销售信息</legend>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="订单号" name="orderCode">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="来源平台" name="sourcePlatform">
                <DictSelector
                  data={dict.online_platform}
                  disabled={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="下单时间" name="dealTime">
                <DatePicker disabled={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="下单数量" name="nummer">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="下单价格" name="price">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>
        </fieldset>

        <fieldset>
          <legend>成本信息</legend>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="供应商" name="supplierName">
                <Selector
                  k="id"
                  v="fullName"
                  readOnly={operateType === 'view'}
                  url="/api/pdos/base/supplier/listAll"/>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="供应商货号" name="supplierNo">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="成本单价" name="costPrice">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>
        </fieldset>

        <fieldset>
          <legend>顾客信息</legend>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="收货人" name="receiver">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="联系方式" name="receiverPhone">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item label="收货地址" name="receiverAddr">
                <Input.TextArea rows={3} readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>
        </fieldset>

        <fieldset>
          <legend>物流信息</legend>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="快递公司" name="shipCompany">
                <DictSelector
                  data={dict.ship_company}
                  disabled={operateType === 'view'}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="快递单号" name="shipNumber">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="快递费用" name="shipPrice">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>
        </fieldset>
        <Divider/>
         <Row gutter={24}>
          <Col span={8} offset={16} style={{fontSize: 15, textAlign:'right', fontWeight: 'bold'}}>
            <Form.Item shouldUpdate>
            {({ getFieldValue }) => {
                const nummer = getFieldValue("nummer") || 0;
                const costPrice = getFieldValue("costPrice") || 0;
                const shipPrice = getFieldValue("shipPrice") || 0;
                const price = getFieldValue("price") || 0;

                const totalCost = math.multiply(nummer, costPrice);
                const totalPrice = math.multiply(nummer, price);

                return  <ul>
                          <li>成本价： {nummer} x { costPrice } = { totalCost } 元</li>
                          <li>快递费用： { shipPrice } 元</li>
                          <li>成本总计：{ math.add(costPrice, shipPrice) } 元</li>
                          <li>销售总计：{nummer} x { price }  = { totalPrice } 元</li>
                          <li style={{color:'#EC7704'}}>利润：{ math.subtract(math.subtract(totalPrice, totalCost), shipPrice)} 元</li>
                        </ul>
              }}
            </Form.Item>
           </Col>
          </Row>
      </Form>
    )
  }

  return (
    <Drawer
      title={`${title[operateType] || '查看'}销售单数据`}
      width="calc(100vw - 240px)"
      onClose={()=> setOperateType("")}
      visible={operateType !== ''}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <Button
            loading={loading}
            onClick={()=> setOperateType("")}
            style={{ marginRight: 8 }}
          >
            关闭
          </Button>
          <Button   loading={loading} onClick={() => handleSaveClick()} type="primary">
            提交
          </Button>
        </div>
      }
    >
        {renderForm()}
    </Drawer>
  );
}
