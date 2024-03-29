import React from 'react';
// import DynamicIcon from 'dynamic-icon';
// // 自定义业务图标
// const BizIcon = props => {
//   const CustomIcon = DynamicIcon.create({
//     fontFamily: 'iconfont',
//     prefix: 'icon',
//     css: 'https://at.alicdn.com/t/font_597299_cfjebjaqyc0rizfr.css',
//   });
//   return <CustomIcon {...props} />;
// };
// export default BizIcon;


import { createFromIconfontCN } from '@ant-design/icons';
const BizIcon = props => {
  const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_597299_cfjebjaqyc0rizfr.css',
  });

  return <MyIcon {...props} />
};
export default BizIcon;
