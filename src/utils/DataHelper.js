import loadsh from 'loadsh';
// 判断是否存在子节点
import { isUrl } from './utils';

export function filterID(data, id, itemArray) {
  // eslint-disable-next-line consistent-return
  return data.forEach(item => {
    if (item.id === id) {
      if (item.children) return itemArray.push(item.name);
    } else if (item.children) {
      filterID(item.children, id, itemArray);
    }
  });
}

export function hasChildren(data, idArray) {
  const itemArray = [];
  idArray.forEach(id => {
    filterID(data, id, itemArray);
  });
  return itemArray.join(',');
}

/**
 * 获得兄弟节点
 * @param data
 * @param targetPid
 * @returns {Array}
 */
export function getNodeBorther(data, targetPid) {
  let dude = [];
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
export function moudleFormatter(data, parentPath = '/') {
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
 * 格式化菜单数据
 * @param data
 * @param parentPath
 */
export function dictFilter(data, searchText) {
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
