import loadsh from 'lodash';
// 判断是否存在子节点
import { isUrl } from './utils';
import IconMap from '@/appicon.jsx';
// 自定义菜单渲染
export function loopMenuItem(menus: Array<Object>): Array<Object>{
  if(!menus) return [];

  return menus.map(({ icon, children, ...item }) => ({
    ...item,
    icon: icon && IconMap[icon],
    children: children && loopMenuItem(children),
  }))
};

export function filterID(data: Array<Object>, id: String, itemArray: Array<Object>) {
  // eslint-disable-next-line consistent-return
  return data.forEach(item => {
    if (item.id === id) {
      if (item.children) return itemArray.push(item.name);
    } else if (item.children) {
      filterID(item.children, id, itemArray);
    }
  });
}

export function hasChildren(data: Array<Object>, idArray: Array<String>) {
  const itemArray: Array<Object> = [];
  idArray.forEach(id => {
    filterID(data, id, itemArray);
  });
  return itemArray.join(',');
}

/**
 *获取第一个叶子节点
 *
 * @export
 * @param {*} data
 * @returns
 */
export function getFirstLeaf(data: Array<Object>){
  let path = data[0].path;
  if(data[0].children){
    path = getFirstLeaf(data[0].children);
  }
  return path;
}
/**
 * 获得兄弟节点
 * @param data
 * @param targetPid
 * @returns {Array}
 */
export function getNodeBorther(data: Array<Object>, targetPid: String) {
  let dude: Array<Object> = [];
  if (targetPid === '0' || targetPid === 0 || targetPid === '-' || targetPid === '' || !targetPid) {
    dude = [...data];
  } else if (data && data.length > 1) {
    data.forEach(item => {
      if (item.id === targetPid) {
        dude = item.children && [...item.children];
      } else if (item.children) {
        getNodeBorther(item.children, targetPid);
      }
    });
  }
  return dude;
}

/**
 * 格式化菜单数据
 * @param data
 * @param parentPath
 */
export function moudleFormatter(data: Array<Object>, parentPath: String = '/') {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
    };
    if (item.children) {
      result.children = moudleFormatter(item.children, `${parentPath}${item.path}/`);
    }
    return result;
  });
}

/**
 * 格式化字典数据
 * @param data
 * @param parentPath
 */
export function dictFilter(data: Array<Object>, searchText: String) {
  if(!data){
    return [];
  }
  const tempData = loadsh.cloneDeep(data);

  return tempData.filter(i => {
    if (searchText && searchText.length > 0) {
      if (i.children) {
        i.children = dictFilter(i.children, searchText);
      }

      return (
        i.name.search(searchText) !== -1 ||
        i.code.search(searchText) !== -1 ||
        (i.children && i.children.length > 0)
      );
    }
    return true;
  });
}
