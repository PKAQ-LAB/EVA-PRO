import React from 'react';
import { connect } from 'umi';
import moment from 'moment';
import { Drawer, Button, Form, Input, Row, Col, DatePicker, Divider } from 'antd';
import * as math from 'mathjs';
import Selector from '@/components/Selector'
import DictSelector from '@/components/DictSelector'

@connect(({ loading, saleSlip, global }) => ({
  global,
  loading: loading.models.saleSlip,
  saleSlip,
}))
export default class AOEForm extends React.PureComponent{

  formRef = React.createRef();

  // 关闭
  handleOnClose = () => {
    this.props.dispatch({
      type:'saleSlip/updateState',
      payload: {
        operateType: '',
        // 清空编辑时留存的数据
        currentItem: {},
      }
    })
  }

  // 保存
  handleSaveClick = () => {
    const { currentItem } = this.props.saleSlip;
    const { validateFields } = this.formRef.current;
    validateFields().then(values => {

      const data = {
        ...values,
        id: currentItem ? currentItem.id : '',
      };
      data.dealTime = moment(data.dealTime).format("YYYY-MM-DD hh:mm:ss");

      this.props.dispatch({
        type: 'saleSlip/save',
        payload: data,
      });
    });
  };

  // 表单渲染
  renderForm = () => {
    const { dict } = this.props.global;
    const { currentItem, operateType } = this.props.saleSlip;

    currentItem.dealTime = moment(currentItem.dealTime) || moment();

    const formItemLayout = {
      labelCol: { flex: "0 0 110px" },
      wrapperCol: { flex: "auto" },
    };


    return (
      <Form size="middle" {...formItemLayout} labelAlign="left" ref={this.formRef} initialValues={currentItem}>
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
              <Form.Item label="成本价" name="costPrice">
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

  render() {
    const { operateType } = this.props.saleSlip;
    const { loading } = this.props;

    return (
      <Drawer
        title="新增销售单数据"
        width="calc(100vw - 240px)"
        onClose={this.handleOnClose}
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
              onClick={this.handleOnClose}
              style={{ marginRight: 8 }}
            >
              关闭
            </Button>
            <Button   loading={loading} onClick={this.handleSaveClick} type="primary">
              提交
            </Button>
          </div>
        }
      >
          {this.renderForm()}
      </Drawer>
    );
  }
}
