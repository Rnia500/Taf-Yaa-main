// src/components/tree/TreeCanvas.jsx
import React, { useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider, // Provider is needed for hooks like useReactFlow
} from 'reactflow';

// Don't forget to import the React Flow styles
import 'reactflow/dist/style.css';

// Import our custom logic and components
import { useFamilyData } from '../../hooks/useFamilyData';
import { calculateLayout } from '../../utils/treeLayout';
import FlowPersonNode from './nodes/FlowPersonNode';
import MonogamousEdge from './edges/MonogamousEdge';
import PolygamousEdge from './edges/PolygamousEdge';

// We define our custom component types outside the main component
// so they don't get recreated on every render.
const nodeTypes = {
  person: FlowPersonNode,
};

const edgeTypes = {
  monogamousEdge: MonogamousEdge,
  polygamousEdge: PolygamousEdge,
};

function TreeCanvas({ treeId }) {
  // 1. Fetch the raw data using our custom hook
  const { people, marriages, loading } = useFamilyData(treeId);

  // 2. Transform the data into nodes and edges that React Flow understands.
  //    useMemo prevents recalculating the layout on every render,
  //    only when the source data (people, marriages) changes.
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
        fitView // This will zoom/pan to fit all nodes on the initial render
        nodesDraggable={false} // Optional: disable dragging nodes
        nodesConnectable={false} // Optional: disable connecting nodes manually
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

// We wrap the entire canvas in the provider to enable React Flow's internal hooks
export default function TreeCanvasWrapper(props) {
  return (
    <ReactFlowProvider>
      <TreeCanvas {...props} />
    </ReactFlowProvider>
  );
}