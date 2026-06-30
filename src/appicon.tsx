import * as AntIcons from '@ant-design/icons';
import {
  type AntdIconProps,
  BarsOutlined,
  FileFilled,
  FlagFilled,
  FormOutlined,
  HomeFilled,
  ProfileFilled,
  RadarChartOutlined,
  RocketFilled,
  SettingFilled,
  SolutionOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import React from 'react';

/**
 * 菜单图标映射：后端返回的 icon 字段（字符串）会映射到这里的 React 节点
 * loopMenuItem(menus, IconMap) 会用到这张表
 */
const staticIconMap: Record<string, React.ReactNode> = {
  form: <FormOutlined />,
  file: <FileFilled />,
  home: <HomeFilled />,
  flag: <FlagFilled />,
  bars: <BarsOutlined />,
  rocket: <RocketFilled />,
  setting: <SettingFilled />,
  profile: <ProfileFilled />,
  solution: <SolutionOutlined />,
  'radar-chart': <RadarChartOutlined />,
  'usergroup-add': <UsergroupAddOutlined />,
};

const toComponentName = (name: string) =>
  `${name
    .replace(/(Outlined|Filled|TwoTone)$/u, '')
    .replace(/[_\s]+/gu, '-')
    .split('-')
    .map((item) => (item ? item[0].toUpperCase() + item.slice(1) : item))
    .join('')}Outlined`;

const IconMap = new Proxy(staticIconMap, {
  get(target, prop: string) {
    if (prop in target) return target[prop];
    const Icon = (
      AntIcons as Record<string, React.ComponentType<AntdIconProps>>
    )[toComponentName(prop)];
    return Icon ? <Icon /> : undefined;
  },
}) as Record<string, React.ReactNode>;

export default IconMap;
