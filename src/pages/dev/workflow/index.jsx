import React, { Component } from 'react';
import Designer from 'wfd';

const data = {
    nodes: [{ id: 'startNode', x: 50, y: 200, label: 'Start', clazz: 'start' },
      { id: 'taskNode1', x: 200, y: 200, label: 'Supervisor', assigneType: 'person', assigneValue: 'admin', isSequential:false, clazz: 'userTask' },
      { id: 'taskNode2', x: 400, y: 200, label: 'Manager', assigneType: 'person', assigneValue: 'admin', isSequential:false, clazz: 'userTask' },
      { id: 'decisionNode', x: 400, y: 320, label: 'Cost > 1000', clazz: 'gateway' },
      { id: 'taskNode3', x: 400, y: 450, label: 'CEO', clazz: 'userTask' },
      { id: 'endNode', x: 600, y: 320, label: 'End', clazz: 'end' }],
    edges: [{ source: 'startNode', target: 'taskNode1', sourceAnchor:1, targetAnchor:3, clazz: 'flow' },
      { source: 'taskNode1', target: 'endNode', sourceAnchor:0, targetAnchor:0, clazz: 'flow' },
      { source: 'taskNode1', target: 'taskNode2', sourceAnchor:1, targetAnchor:3, clazz: 'flow' },
      { source: 'taskNode2', target: 'decisionNode', sourceAnchor:1, targetAnchor:0, clazz: 'flow' },
      { source: 'taskNode2', target: 'taskNode1', sourceAnchor:2, targetAnchor:2, clazz: 'flow' },
      { source: 'decisionNode', target: 'taskNode3', sourceAnchor:2, targetAnchor:0, clazz: 'flow' },
      { source: 'decisionNode', target: 'endNode', sourceAnchor:1, targetAnchor:2, clazz: 'flow'},
      { source: 'taskNode3', target: 'endNode', sourceAnchor:1, targetAnchor:1, clazz: 'flow' },
      { source: 'taskNode3', target: 'taskNode1', sourceAnchor:3, targetAnchor:2, clazz: 'flow'}],
}

export default class WFDemo extends Component {
    constructor(props) {
        super(props);
        this.wfDef = React.createRef();
        console.info("1111")
    }

    handleSave = () => {
        const bpm = this.wfDef.current.graph.save();
    }

    render(){
        const candidateUsers = [{id:'1',name:'Tom'},{id:'2',name:'Steven'},{id:'3',name:'Andy'}];
        const candidateGroups = [{id:'1',name:'Manager'},{id:'2',name:'Security'},{id:'3',name:'OA'}];
        return (
            <>
               11111111111111
            </>
        )
    }
}
