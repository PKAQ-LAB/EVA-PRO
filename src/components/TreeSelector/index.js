import React, { PureComponent } from 'react';
import { TreeSelect } from 'antd';
import request from '@src/utils/request';
/**
 * 远程获取树形结构下拉菜单选项
 */
export default class TreeSelector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
    };
  }

  componentDidMount() {
    const { url, showAll = true } = this.props;
    if (url) {
      request(url).then(response => {
        if (response && response.success) {
          const treeData = response.success;
          if (showAll) {
            treeData.unshift({
              key: '',
              value: '',
              title: '全部',
            });
          }
          this.setState({
            treeData: response.data,
          });
        }
      });
    }
  }

  render() {
    const { treeData } = this.state;
    return <TreeSelect {...this.props} treeData={treeData} treeNodeLabelProp="pathName" />;
  }
}
