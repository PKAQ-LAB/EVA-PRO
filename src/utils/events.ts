import { EventEmitter } from 'node:events';

/** 全局事件总线，跨模块通信 */
export default new EventEmitter();
