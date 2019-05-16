import React from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import DictGrid from './DictGrid';
import DictDetail from './DictDetail';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';

@connect(({ dict }) => ({
  dict,
}))
export default class Dict extends React.Component {
  render() {
    const { dispatch } = this.props;
    const {
      currentItem,
      itemOperateType,
      data,
      loading,
      operateType,
      codeUnique,
      itemValues,
    } = this.props.dict;

    const DictGridProps = {
      dispatch,
      loading,
      data,
    };

    const DictDetailProps = {
      codeUnique,
      currentItem,
      dispatch,
      loading,
      data,
      operateType,
      itemOperateType,
      itemValues,
    };

    return (
      <PageHeaderWrapper title="字典信息管理">
        <Row gutter={8} type="flex" justify="space-around">
          {/* 左侧列表 */}
          <Col xl={6} lg={6} md={6} sm={6} xs={6}>
            <DictGrid {...DictGridProps} />
          </Col>
          {/* 右-上-字典键值列表 */}
          {/* 右-下-字典键值新增/编辑区域 */}
          <Col xl={17} lg={17} md={17} sm={17} xs={17}>
            <DictDetail {...DictDetailProps} />
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}
