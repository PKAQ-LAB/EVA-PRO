import React from 'react';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
// 引入列表界面和新增界面
import List from './list';
import AOEForm from './aoeform';

// 与 models/moduleMdl.js 中的namespace指定的 model进行绑定
// 这里将 state中的module赋值给module并绑定到当前组件的props上
@connect(state => ({
  module: state.module,
}))
// 新建一个Demo组件 在本工程中需要在config/router.config.js中进行配置路由
export default class Module extends React.PureComponent {
  // 渲染函数
  render() {
    // dispatch可以调用connect绑定的model中的effects或reducers
    const { dispatch } = this.props;
    // 从当前组件绑定的props中获取modle中定义的属性
    const { data, selectedRowKeys, modalType, currentItem } = this.props.module;

    // 给list组件使用的对象 作为参数传入
    // 这里最后一个对象后面可以带着逗号
    // 由于传入的对象名与作为值引用的对象名字相同这里可以采用省略写法
    // 原始写法 {dispatch: dispatch}
    const tableProps = {
      dispatch,
      selectedRowKeys,
      data,
    };

    // 给aoeform组件使用的对象 作为参数传入
    const modalProps = {
      data,
      dispatch,
      currentItem,
      modalType,
    };

    return (
      <PageHeaderWrapper title="模块管理">
        {/*
        ... : 解构赋值语法
        根据前面对tableProps对象的定义
        相当于   <List dispatch={dispatch}  selectedRowKeys={selectedRowKeys} data={data}/>
        https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
        */}
        <List {...tableProps} />
        {/* 只有当modalType不为 ‘’ 的时候才显示新增的弹窗 */}
        {modalType !== '' && <AOEForm {...modalProps} />}
      </PageHeaderWrapper>
    );
  }
}
