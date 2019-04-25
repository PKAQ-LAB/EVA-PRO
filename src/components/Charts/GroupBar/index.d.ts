import React from 'react';
export interface IGroupBarProps {
  title: React.ReactNode;
  color?: string;
  padding?: [number, number, number, number];
  height: number;
  x_name: string;
  y_name: string;
  series: []
  data: [];
  autoLabel?: boolean;
  style?: React.CSSProperties;
}

export default class GroupBar extends React.Component<IGroupBarProps, any> {}
