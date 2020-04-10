import React, { PureComponent } from 'react';
import { TreeSelect } from 'antd';
import request from '@/utils/request';
/**
 * 远程获取树形结构下拉菜单选项
 */

const treeSelectSearchProps = {
  showSearch: true,
  filterTreeNode: (val, node) => new RegExp(val, 'i').test(`${node.value}${node.title}`),
};

const treeSelectTravelData = (data, valueKey, titleKey, childrenKey) =>
  data.map(item => {
    const { [titleKey]: title, [valueKey]: value, [childrenKey]: children } = item;
    const newItem = {
      title,
      value,
    };
    if (Array.isArray(children) && children.length > 0) {
      newItem.children = treeSelectTravelData(children, valueKey, titleKey, childrenKey);
    }
    return newItem;
});

export default class TreeSelector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
    };
  }

  componentDidMount() {
    const { url, showAll = true, data } = this.props;
    if (url) {
      request(url).then(response => {
        if (response && response.success) {
          const record = response.success;
          if (showAll) {
            data.unshift({
              key: '',
              value: '',
              title: '全部',
            });
          }
          this.setState({
            treeData: record.data,
          });
        }
      });
    } else {
      this.setState({
        treeData: data,
      });
    }
  }

  render() {
    const { treeData } = this.state;
    const { search, keys, value } = this.props;

    let data = treeData;

    if (treeData.length && keys) {
        const [ valueKey, titleKey, childrenKey ] = keys;

        data = treeSelectTravelData(treeData, valueKey, titleKey, childrenKey);
    }
    return <TreeSelect
            treeData={data}
            value={treeData.length > 0 ? value : undefined}
            {...(search === true && treeSelectSearchProps)}
            {...this.props}
            />;
  }
}
