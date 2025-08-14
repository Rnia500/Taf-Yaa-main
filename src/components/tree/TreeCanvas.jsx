// src/components/tree/TreeCanvas.jsx
import React, { useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFamilyData } from '../../hooks/useFamilyData';
import { calculateLayout } from '../../utils/treeLayout';
import MarriageNode from './nodes/MarriageNode';
import FlowPersonNode from './nodes/FlowPersonNode';
import MonogamousEdge from './edges/MonogamousEdge';
import PolygamousEdge from './edges/PolygamousEdge';

// ✨ MOVE THESE DEFINITIONS OUTSIDE THE COMPONENT
// They are now defined only once when the module is loaded.
const nodeTypes = {
  person: FlowPersonNode,
  marriage: MarriageNode,
};

const edgeTypes = {
  monogamousEdge: MonogamousEdge,
  polygamousEdge: PolygamousEdge,
};

function TreeCanvas({ treeId }) {
  const { people, marriages, loading } = useFamilyData(treeId);

  const { nodes, edges } = useMemo(
    () => calculateLayout(people, marriages),
    [people, marriages]
  );

  if (loading) {
    return <div>Loading Family Tree...</div>;
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodeOrigin={[0.5, 0.5]}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default function TreeCanvasWrapper(props) {
  return (
    <ReactFlowProvider>
      <TreeCanvas {...props} />
    </ReactFlowProvider>
  );
}