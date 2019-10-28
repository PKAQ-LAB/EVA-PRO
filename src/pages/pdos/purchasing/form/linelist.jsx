import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Divider, Popconfirm, Upload, Modal } from 'antd';
import * as XLSX from 'xlsx';
import defaultSettings from '@config/defaultSettings';
import DataTable from '@src/components/DataTable';

import LineAOEForm from './lineform';

@connect(state => ({
  global: state.global,
  purchasing: state.purchasing,
  loading: state.loading.models.purchasing,
}))
export default class PurchasingLineList extends PureComponent {
  // 新增窗口
  handleModalVisible = () => {
    this.props.dispatch({
      type: 'purchasing/updateState',
      payload: {
        modalType: 'create',
        editItem: undefined,
      },
    });
  };

  // 删除明细
  handleDeleteClick = index => {
    const { lineData, selectedLineRowKeys } = this.props.purchasing;
    if (index || index === 0) {
      lineData.splice(index, 1);
    } else {
      selectedLineRowKeys.forEach(item => {
        lineData.splice(item, 1);
      });
    }
    this.props.dispatch({
      type: 'purchasing/updateState',
      payload: { lineData },
    });
  };

  // 修改编辑
  handleEditClick = (record, index) => {
    this.props.dispatch({
      type: 'purchasing/updateState',
      payload: {
        modalType: 'edit',
        editItem: index,
      },
    });
  };

  // 行选事件
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'purchasing/updateState',
      payload: { selectedLineRowKeys: rows },
    });
  };

  // excel上传
  handleUpload = (file, fileList) => {
    let { lineData } = this.props.purchasing;
    const that = this;

    const rABS = true;
    const f = fileList[0];
    const reader = new FileReader();
    reader.onload = e => {
      let data = e.target.result;
      if (!rABS) data = new Uint8Array(data);
      const workbook = XLSX.read(data, {
        type: rABS ? 'binary' : 'array',
      });

      const errors = {
        success: 0,
        error: 0,
        errorLine: [],
      };

      // 假设我们的数据在第一个标签
      const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];
      // XLSX自带了一个工具把导入的数据转成json
      let jsonArr = XLSX.utils.sheet_to_json(firstWorksheet, { header: 1 });
      // 通过自定义的方法处理Json，比如加入state来展示
      // 删除表头
      jsonArr.shift();
      // 删除空行
      jsonArr = jsonArr.filter(item => item && item.length > 0);

      errors.success = jsonArr.length;

      jsonArr = jsonArr.map((item, index) => {
        // 错误记录
        if (!item[1] || !item[2]) {
          errors.success -= 1;
          errors.error += 1;
          errors.errorLine.push(index + 2);
          return {};
        }
        // 构建子表对象
        const tempObj = {
          name: item[0],
          categroy: item[1],
          model: item[2],
          barcode: item[3],
        };

        return tempObj;
      });
      // 过滤空对象
      jsonArr = jsonArr.filter(item => Object.keys(item).length > 0);

      lineData = lineData.concat(jsonArr);

      that.props.dispatch({
        type: 'purchasing/updateState',
        payload: { lineData },
      });
      // 导入提示
      Modal.info({
        title: '导入完成',
        content: (
          <div>
            <p style={{ color: 'green' }}>导入成功: {errors.success} 条.</p>
            <p style={{ color: 'red' }}>导入失败: {errors.error} 条.</p>
            {errors.errorLine && errors.errorLine.length > 1 && (
              <p>第 [{errors.errorLine.join(' , ')}] 行导入失败.</p>
            )}
          </div>
        ),
      });
    };

    if (rABS) {
      reader.readAsBinaryString(f);
    } else {
      reader.readAsArrayBuffer(f);
    }

    return false;
  };

  renderBtn() {
    const { view = false } = this.props;
    const { selectedLineRowKeys } = this.props.purchasing;
    return (
      <div>
        {!view && (
          <Button type="primary" onClick={() => this.handleModalVisible()}>
            新增明细
          </Button>
        )}
        {!view && <Divider type="vertical" />}
        {!view && selectedLineRowKeys.length > 0 && (
          <Popconfirm
            title="确定要删除选中的采购入库单明细吗?"
            placement="top"
            onConfirm={() => this.handleDeleteClick()}
          >
            <Button type="danger">删除</Button>
          </Popconfirm>
        )}
        {selectedLineRowKeys.length > 0 && <Divider type="vertical" />}
        {!view && (
          <Upload beforeUpload={this.handleUpload} showUploadList={false}>
            <Button>Excel导入</Button>
          </Upload>
        )}
        {!view && <Divider type="vertical" />}
        {!view && (
          <Button href={`${defaultSettings.URL}/template.xlsx`} target="_blank">
            {' '}
            下载Excel导入模板
          </Button>
        )}
      </div>
    );
  }

  render() {
    const { viewLineData, selectedLineRowKeys, lineData, modalType } = this.props.purchasing;
    const { loading, view = false } = this.props;
    const { dict } = this.props.global;

    const columns = [
      {
        render: (t, r, i) => i + 1,
        width: 30,
        fixed: 'left',
      },
      {
        title: '品名',
        name: 'name',
        tableItem: {},
        sorter: (a, b) => a.carNum && a.carNum.localeCompare(b.carNum),
      },
      {
        title: '分类名称',
        name: 'category',
        tableItem: {
          render: text => dict.goods_type[text],
        },
      },
      {
        title: '产品型号',
        name: 'model',
        width: 130,
        tableItem: {},
      },
      {
        title: '条码',
        name: 'barcode',
        tableItem: {},
      },
      {
        fixed: 'right',
        width: 120,
        tableItem: {
          render: (text, record, index) => (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>
              {!view && <a onClick={() => this.handleEditClick(record, index)}>修改</a>}
              {!view && <Divider type="vertical" />}
              {!view && (
                <Popconfirm
                  title="确定要删除吗？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => this.handleDeleteClick(index)}
                >
                  <a>删除</a>
                </Popconfirm>
              )}
            </div>
          ),
        },
      },
    ];

    const dataTableProps = {
      columns,
      rowKey: 'id',
      loading,
      showNum: true,
      isScroll: true,
      alternateColor: true,
      selectType: 'checkbox',
      dataItems: view ? { records: viewLineData } : { records: lineData } || [],
      selectedLineRowKeys,
      onChange: this.handleListChange,
      onSelect: this.handleSelectRows,
    };

    return (
      <Card
        title="采购入库单明细"
        extra={this.renderBtn()}
        headStyle={{ padding: 0 }}
        bodyStyle={{ padding: 0 }}
        bordered={false}
      >
        <DataTable {...dataTableProps} />;{modalType && <LineAOEForm />}
      </Card>
    );
  }
}
