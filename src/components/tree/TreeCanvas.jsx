// src/components/tree/TreeCanvas.jsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../styles/treeCanvas.css';

import { useFamilyData } from '../../hooks/useFamilyData';
import { calculateLayout, traceLineage, filterFamilyByRoot } from '../../utils/treeLayout';
import MarriageNode from './nodes/MarriageNode';
import FlowPersonNode from './nodes/FlowPersonNode';
import MonogamousEdge from './edges/MonogamousEdge';
import PolygamousEdge from './edges/PolygamousEdge';
import ParentChildEdge from './edges/ParentChildEdge';
import PersonMenu from '../PersonMenu';
import usePersonMenuStore from '../../store/usePersonMenuStore';
import useSidebarStore from '../../store/useSidebarStore';

const nodeTypes = { person: FlowPersonNode, marriage: MarriageNode };
const edgeTypes = { monogamousEdge: MonogamousEdge, polygamousEdge: PolygamousEdge, parentChild: ParentChildEdge };

const CustomMarkers = () => (
  <svg>
    <defs>
      <marker id="arrow" viewBox="0 -5 10 10" refX={10} refY={0} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
        <path d="M0,-5L10,0L0,5" fill="var(--color-gray)" />
      </marker>
      <marker id="circle" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={8} markerHeight={8}>
        <circle cx="5" cy="5" r="3" stroke="var(--color-gray)" strokeWidth="1.5" fill="white" />
      </marker>
    </defs>
  </svg>
);

function TreeCanvas({ treeId }) {
  const { people: allPeople, marriages: allMarriages, loading } = useFamilyData(treeId);
  const [peopleWithCollapseState, setPeopleWithCollapseState] = useState(allPeople);
  const [rootPersonId, setRootPersonId] = useState('p001');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState({ nodes: [], edges: [] });

  const { closeMenu } = usePersonMenuStore((state) => state.actions);
  const openProfileSidebar = useSidebarStore((state) => state.openSidebar);

  const handleToggleCollapse = useCallback((personId) => {
    setPeopleWithCollapseState((currentPeople) =>
      currentPeople.map((p) => (p.id === personId ? { ...p, isCollapsed: !p.isCollapsed } : p))
    );
  }, []);

  const handleOpenProfile = useCallback((personId) => {
    if (openProfileSidebar) openProfileSidebar(personId);
  }, [openProfileSidebar]);
  
  const handleTraceLineage = useCallback((personId) => {
    const path = traceLineage(personId, allPeople, allMarriages);
    setHighlightedPath(path);
  }, [allPeople, allMarriages]);
  
  const handleSetAsRoot = useCallback((personId) => {
    setRootPersonId(personId);
    setHighlightedPath({ nodes: [], edges: [] });
  }, []);

  const handleResetView = useCallback(() => {
    setRootPersonId('p001');
  }, []);

  const clearHighlight = useCallback(() => {
    if (highlightedPath.nodes.length > 0 || highlightedPath.edges.length > 0) {
      setHighlightedPath({ nodes: [], edges: [] });
    }
    closeMenu();
  }, [highlightedPath, closeMenu]);

  // ✨ THE FIX: This `useMemo` block is now corrected and robust.
  const { visiblePeople, visibleMarriages } = useMemo(() => {
    // First, create the most up-to-date list of people with their collapse status.
    const peopleWithUpdatedCollapse = allPeople.map(p => {
        const statefulPerson = peopleWithCollapseState.find(sp => sp.id === p.id);
        return statefulPerson || p;
    });

    if (rootPersonId === 'p001') {
      // If we are at the default root, return the full (but updated) dataset.
      return { visiblePeople: peopleWithUpdatedCollapse, visibleMarriages: allMarriages };
    }
    
    // If we have a custom root, filter the data.
    const filteredData = filterFamilyByRoot(rootPersonId, peopleWithUpdatedCollapse, allMarriages);
    
    // The key fix: We rename the properties to match the destructuring.
    return { visiblePeople: filteredData.people, visibleMarriages: filteredData.marriages };
  }, [rootPersonId, peopleWithCollapseState, allPeople, allMarriages]);

  const { nodes, edges } = useMemo(
    () => calculateLayout(rootPersonId, visiblePeople, visibleMarriages, handleToggleCollapse, handleOpenProfile),
    [rootPersonId, visiblePeople, visibleMarriages, handleToggleCollapse, handleOpenProfile]
  );
  
  const finalEdges = useMemo(() => {
    return edges.map(edge => {
      const isHighlighted = highlightedPath.edges.includes(edge.id);
      const isHovered = edge.source === hoveredNodeId || edge.target === hoveredNodeId;
      let style = { stroke: 'var(--color-gray)', strokeWidth: 2 };
      let animated = false;
      let className = '';
      if (isHighlighted) {
        style = { stroke: 'green', strokeWidth: 3 };
        className = 'lineage-edge';
      }
      if (isHovered) {
        style = { stroke: 'var(--color-primary)', strokeWidth: 4 };
        animated = true;
      }
      return { ...edge, style, animated, className };
    });
  }, [hoveredNodeId, edges, highlightedPath]);
  
  useEffect(() => {
    setPeopleWithCollapseState(allPeople);
  }, [allPeople]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ height: '100%', width: '100%' }} onMouseDown={clearHighlight}>
      <PersonMenu 
        handleToggleCollapse={handleToggleCollapse} 
        handleOpenProfile={handleOpenProfile}
        handleTraceLineage={handleTraceLineage}
        handleSetAsRoot={handleSetAsRoot}
        handleResetView={handleResetView}
      />
      <ReactFlow
        nodes={nodes}
        edges={finalEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeMouseEnter={(event, node) => setHoveredNodeId(node.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Controls />
        <CustomMarkers />
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