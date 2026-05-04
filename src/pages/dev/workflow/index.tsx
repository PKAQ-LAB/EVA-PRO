import { PageContainer } from '@ant-design/pro-components';
import { Alert, Card } from 'antd';
import React from 'react';

interface WorkflowNode {
  id: string;
  x: number;
  y: number;
  label: string;
  clazz: string;
  assigneType?: string;
  assigneValue?: string;
  isSequential?: boolean;
}

interface WorkflowEdge {
  source: string;
  target: string;
  sourceAnchor: number;
  targetAnchor: number;
  clazz: string;
}

/**
 * V5 沿用样例数据（来自 EVA-PRO 的 wfd 工作流设计器 demo）。
 * V5 实际仅渲染了 "11111111111111" 占位文本，并未实例化设计器。
 * V6 阶段保留示例数据结构与 README 性质的提示，待选型 antv-x6 /
 * bpmn-js / GoJS 后由专业设计器接管。
 */
const sampleWorkflow: { nodes: WorkflowNode[]; edges: WorkflowEdge[] } = {
  nodes: [
    { id: 'startNode', x: 50, y: 200, label: 'Start', clazz: 'start' },
    {
      id: 'taskNode1',
      x: 200,
      y: 200,
      label: 'Supervisor',
      assigneType: 'person',
      assigneValue: 'admin',
      isSequential: false,
      clazz: 'userTask',
    },
    {
      id: 'taskNode2',
      x: 400,
      y: 200,
      label: 'Manager',
      assigneType: 'person',
      assigneValue: 'admin',
      isSequential: false,
      clazz: 'userTask',
    },
    {
      id: 'decisionNode',
      x: 400,
      y: 320,
      label: 'Cost > 1000',
      clazz: 'gateway',
    },
    { id: 'taskNode3', x: 400, y: 450, label: 'CEO', clazz: 'userTask' },
    { id: 'endNode', x: 600, y: 320, label: 'End', clazz: 'end' },
  ],
  edges: [
    {
      source: 'startNode',
      target: 'taskNode1',
      sourceAnchor: 1,
      targetAnchor: 3,
      clazz: 'flow',
    },
    {
      source: 'taskNode1',
      target: 'endNode',
      sourceAnchor: 0,
      targetAnchor: 0,
      clazz: 'flow',
    },
    {
      source: 'taskNode1',
      target: 'taskNode2',
      sourceAnchor: 1,
      targetAnchor: 3,
      clazz: 'flow',
    },
    {
      source: 'taskNode2',
      target: 'decisionNode',
      sourceAnchor: 1,
      targetAnchor: 0,
      clazz: 'flow',
    },
    {
      source: 'taskNode2',
      target: 'taskNode1',
      sourceAnchor: 2,
      targetAnchor: 2,
      clazz: 'flow',
    },
    {
      source: 'decisionNode',
      target: 'taskNode3',
      sourceAnchor: 2,
      targetAnchor: 0,
      clazz: 'flow',
    },
    {
      source: 'decisionNode',
      target: 'endNode',
      sourceAnchor: 1,
      targetAnchor: 2,
      clazz: 'flow',
    },
    {
      source: 'taskNode3',
      target: 'endNode',
      sourceAnchor: 1,
      targetAnchor: 1,
      clazz: 'flow',
    },
    {
      source: 'taskNode3',
      target: 'taskNode1',
      sourceAnchor: 3,
      targetAnchor: 2,
      clazz: 'flow',
    },
  ],
};

const DevWorkflowPage: React.FC = () => (
  <PageContainer title="工作流" subTitle="流程定义与运行时（待接入设计器）">
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      message="工作流模块占位"
      description={
        <div>
          V5 EVA-PRO 仅引入了 wfd 包但未实际渲染设计器。V6 阶段建议替换为 AntV
          X6 / bpmn-js / GoJS 等当前活跃的图形编辑器之一，并将
          src/services/user.ts 中尚未提供的 workflow 接口（保存 BPMN、
          下发流程实例、节点办理）与之对接。
        </div>
      }
    />
    <Card title="示例流程数据" size="small">
      <pre
        style={{
          margin: 0,
          padding: 16,
          backgroundColor: '#fafafa',
          border: '1px solid #f0f0f0',
          borderRadius: 4,
          fontSize: 12,
          maxHeight: 480,
          overflow: 'auto',
        }}
      >
        {JSON.stringify(sampleWorkflow, null, 2)}
      </pre>
    </Card>
  </PageContainer>
);

export default DevWorkflowPage;
