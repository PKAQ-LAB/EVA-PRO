import React, { Component } from 'react';
import { Table, Pagination, Tooltip } from 'antd';
import objectAssign from 'object-assign';
import cx from 'classnames';
/**
 * 数据表格
 */
export default class DataTable extends Component {
  handleTableChange = (pagination, filters, sorter) => {
    const pageNum = pagination.current || pagination;

    const sortMap = sorter.field
      ? {
          [sorter.field]: sorter.order === 'ascend' ? 'asc' : 'desc',
        }
      : sorter;
    return this.props.onChange && this.props.onChange({ pageNum, filters, sorter: sortMap });
  };

  onShowSizeChange = (pageNum, pageSize) => {
    return this.props.onChange && this.props.onChange({ pageNum, pageSize });
  };

  render() {
    const {
      prefixCls,
      className,
      columns,
      dataItems,
      showNum,
      alternateColor,
      onChange,
      selectType,
      rowSelection,
      isScroll,
      pagination,
      rowKey,
      ...otherProps
    } = this.props;

    const classname = cx(prefixCls, className, {
      'table-row-alternate-color': alternateColor,
    });

    // 分页
    const paging = objectAssign(
      {
        total: dataItems.total,
        pageSize: dataItems.pageSize,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `共 ${total} 条`,
        onShowSizeChange: this.onShowSizeChange,
      },
      dataItems.pageNum && { current: dataItems.pageNum },
      pagination,
    );

    const rs = {
      type: selectType === 'radio' ? 'radio' : 'checkbox',
      selectedRowKeys: [],
      onChange: this.onSelectChange,
      ...rowSelection,
    };

    return (
      <div className={classname}>
        <Table
          size="small"
          rowSelection={selectType ? rs : null}
          onRow={
            selectType
              ? (record, index) => ({
                  onClick: _ => this.tableOnRow(record, index),
                })
              : () => {}
          }
          scroll={isScroll ? objectAssign({ x: true }) : {}}
          bodyStyle={{ overflowX: 'auto' }}
          columns={columns}
          pagination={pagination ? paging : false}
          dataSource={dataItems.list}
          onChange={this.handleTableChange}
          {...otherProps}
        />
      </div>
    );
  }
}
