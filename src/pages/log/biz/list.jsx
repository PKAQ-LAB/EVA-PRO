import React from 'react';
import moment from 'moment';
import { Table, Form, Button, Row, Col, Divider, DatePicker } from 'antd';

import Service from '@/services/service';
import API from '@/apis';


const { RangePicker } = DatePicker;

export default (props) => {
  const [ form ] = Form.useForm();

  const { fetch, setCurrentItem, setOperateType, tableProps,} = props;

  // 重置
  const handleFormReset = () => {
    form.resetFields();
    fetch();
  };

  // 查询
  const handleSearch = () => {
    const { validateFields } = form;

    validateFields().then(values => {

      const param = {};
      param.begin = values.operateDatetime
        ? moment(values.operateDatetime[0]).format('YYYY-MM-DD')
        : '';
      param.end = values.operateDatetime ? moment(values.operateDatetime[1]).format('YYYY-MM-DD') : '';

      fetch(param);
    });
  };

  // 查询条件渲染
  const renderForm = () => {
    return (
      <Form layout="inline" initialValues={{"operateDatetime":[moment().add(-7, 'days'), moment()]}} form={form}>
        <Row type="flex" justify="space-between">
          <Col>
            <Form.Item label="操作时间" name="operateDatetime">
              <RangePicker />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button type="primary" onClick={handleSearch} >
                查询
              </Button>
              <Divider type="vertical" />
              <Button onClick={handleFormReset} >
                重置
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  // 查看明细
 const handleEditClick = records => {
    if (!records.id) {
      return;
    }
    Service.get(API.BIZLOG_GET, records.id,
    ).then((res) => {
      if(res.success){
        setOperateType("check");
        setCurrentItem(res.data);
      }
    })
  };

  const columns = [
    {
      title: '操作时间',
      dataIndex: 'operateDatetime',
    },
    {
      title: '操作类型',
      dataIndex: 'operateType',
    },
    {
      title: '操作人',
      dataIndex: 'operator',
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '操作',
      render: (text, record) => <a onClick={e => handleEditClick(record, e)}>查看明细</a>,
    },
  ];

    return (
      <>
        <div className="eva-ribbon">{renderForm()}</div>
        <div className="eva-body">
          <Table {...tableProps} columns={columns}/>
        </div>
      </>
    );
}
