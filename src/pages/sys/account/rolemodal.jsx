import React, { useState } from 'react';
import { Transfer, Modal } from 'antd';
import { grantUser } from './services/accountSvc';

export default (props) => {
  const { roleModal, setRoleModal, roles, currentItem } = props;
  const [ loading, setLoading ] = useState(false);
  const [ selectedRoles, setSelectedRoles ] = useState((currentItem.roles && currentItem.roles.map(item => item.id )) || [] );

  // 转换成符合穿梭框格式的数据
  const rolesData = roles && roles.map(item => {
    const obj = {
      key: item.id,
      title: item.name,
      description: item.name
    };
    return obj;
  });


  // 保存权限关系
  const handleSubmit = () => {

    setLoading(true);

    const { id } = currentItem;

    const sr = selectedRoles && selectedRoles.map(item => {
      const obj = { id: item };
      return obj;
    });

    grantUser({
      id,
      roles: sr,
    }).then(()=>{
      setLoading(false);
      setRoleModal("");
    })
  };

  return (
    <Modal
      visible={ roleModal !== '' }
      title="选择授权角色"
      okText="确定"
      cancelText="关闭"
      maskClosable={false}
      width="45%"
      centered
      confirmLoading={ loading }
      onOk={() => handleSubmit()}
      onCancel={() => setRoleModal("")}
      bodyStyle={{ height: 456, maxHeight: 456, padding: 0, overflowY: 'auto' }}
    >
      <Transfer
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        render={item => item.title}
        listStyle={{ width: '45%', height: '90%' }}
        dataSource={rolesData}
        targetKeys={selectedRoles}
        onChange={(checkedKeys) => setSelectedRoles(checkedKeys)}
        titles={['可选角色', '已选角色']}
        unit="个"
        searchMsg="搜索角色"
      />
    </Modal>
  );

}
