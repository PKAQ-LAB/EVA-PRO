/**
 * 这个文件作为组件的目录
 * 目的是统一管理对外输出的组件，方便分类
 */
/**
 * 布局组件
 */
import Footer from './Footer';
import {
  DocLink,
  FullscreenToggle,
  LangDropdown,
  VersionDropdown,
} from './RightContent';
import { AvatarDropdown } from './RightContent/AvatarDropdown';

/**
 * 业务组件
 */
export { default as ArticleListContent } from './ArticleListContent';
export { default as AvatarList } from './AvatarList';
/**
 * EVA-PRO 自定义组件第一批 (TASK-07)
 */
export { default as BizIcon } from './BizIcon';
export { default as CopyBlock } from './CopyBlock';
export { default as CountDown } from './CountDown';
export { default as DictSelector } from './DictSelector';
export { default as IconSelect } from './IconSelect';
export { default as LunarCalendar } from './LunarCalendar';
export { default as Page } from './Page';
export { default as PageLoading } from './PageLoading';
export { default as PatternLock } from './PatternLock';
export { default as Selector } from './Selector';
export { default as SideLayout } from './SideLayout';
export { default as StandardFormRow } from './StandardFormRow';
export { default as TagSelect } from './TagSelect';
export { default as TreeSelector } from './TreeSelector';
export { default as WaterFall } from './WaterFall';

export {
  AvatarDropdown,
  DocLink,
  Footer,
  FullscreenToggle,
  LangDropdown,
  VersionDropdown,
};
