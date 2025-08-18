// src/components/tree/TreeCanvas.jsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  ReactFlowProvider,
  useReactFlow, 
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../styles/treeCanvas.css';

import { useFamilyData } from '../../hooks/useFamilyData';
import { calculateLayout, traceLineage, filterFamilyByRoot } from '../../utils/treeLayout';
import MarriageNode from './nodes/MarriageNode';
import FlowPersonNode from './nodes/FlowPersonNode';
import FlowPersonNodeHorizontal from './nodes/FlowPersonNodeHorizontal';
import MonogamousEdge from './edges/MonogamousEdge';
import PolygamousEdge from './edges/PolygamousEdge';
import ParentChildEdge from './edges/ParentChildEdge';
import PersonMenu from '../PersonMenu';
import CustomControls from './CustomControls'; 
import Legend from './Legend';
import usePersonMenuStore from '../../store/usePersonMenuStore';
import useSidebarStore from '../../store/useSidebarStore';

const nodeTypes = { person: FlowPersonNode, marriage: MarriageNode,  personHorizontal: FlowPersonNodeHorizontal };
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

function TreeCanvasComponent({ treeId }) {
  const { people: allPeople, marriages: allMarriages, loading } = useFamilyData(treeId);
  const [peopleWithCollapseState, setPeopleWithCollapseState] = useState(allPeople);
  const [rootPersonId, setRootPersonId] = useState('p001');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState({ nodes: [], edges: [] });
  const [lineageEdges, setLineageEdges] = useState([]);

  const { closeMenu } = usePersonMenuStore((state) => state.actions);
  const openProfileSidebar = useSidebarStore((state) => state.openSidebar);
  
    const { visiblePeople, visibleMarriages } = useMemo(() => {
    const peopleWithUpdatedCollapse = allPeople.map(p => {
        const statefulPerson = peopleWithCollapseState.find(sp => sp.id === p.id);
        return statefulPerson || p;
    });
    if (rootPersonId === 'p001') {
      return { visiblePeople: peopleWithUpdatedCollapse, visibleMarriages: allMarriages };
    }
    const filteredData = filterFamilyByRoot(rootPersonId, peopleWithUpdatedCollapse, allMarriages);
    return { visiblePeople: filteredData.people, visibleMarriages: filteredData.marriages };
  }, [rootPersonId, peopleWithCollapseState, allPeople, allMarriages]);

  const { fitView } = useReactFlow();
  const [orientation, setOrientation] = useState('vertical');

  const handleToggleCollapse = useCallback((personId) => {
    setPeopleWithCollapseState((currentPeople) =>
      currentPeople.map((p) => (p.id === personId ? { ...p, isCollapsed: !p.isCollapsed } : p))
    );
  }, []);

  const handleOpenProfile = useCallback((personId) => {
    if (openProfileSidebar) openProfileSidebar(personId);
  }, [openProfileSidebar]);

   const { nodes, edges: baseEdges } = useMemo(
    () => calculateLayout(rootPersonId, visiblePeople, visibleMarriages, handleToggleCollapse, handleOpenProfile, orientation),
    [rootPersonId, visiblePeople, visibleMarriages, handleToggleCollapse, handleOpenProfile, orientation]
  );
  
  // ✨ THE FIX: This handler now creates the animated overlay.
  const handleTraceLineage = useCallback((personId) => {
    const path = traceLineage(personId, allPeople, allMarriages);
    
    // Find the full edge objects from our base layout that match the lineage path.
    const highlightedBaseEdges = baseEdges.filter(edge => path.edges.includes(edge.id));

    // Create a new set of green, animated edges for the overlay.
    const animatedOverlay = highlightedBaseEdges.map(edge => ({
      ...edge,
      id: `lineage-${edge.id}`, // Give it a unique ID to prevent conflicts
      style: {  color: 'red' ,stroke: "var(--color-primary1)", strokeWidth: 8 },
      className: 'lineage-edge', // This is what triggers your CSS animation
    }));

    setLineageEdges(animatedOverlay);
  }, [allPeople, allMarriages, baseEdges]);
  
  const handleSetAsRoot = useCallback((personId) => {
    setRootPersonId(personId);
    setHighlightedPath({ nodes: [], edges: [] });
  }, []);

  const handleResetView = useCallback(() => {
    setRootPersonId('p001');
    setPeopleWithCollapseState((currentPeople) =>
      currentPeople.map((p) => ({ ...p, isCollapsed: false }))
    );
    setHighlightedPath({ nodes: [], edges: [] });
    closeMenu();
    setTimeout(() => {
      fitView({ duration: 800 });
    }, 50);
  }, [fitView, closeMenu]); 

  const clearHighlight = useCallback(() => {
    if (highlightedPath.nodes.length > 0 || highlightedPath.edges.length > 0) {
      setHighlightedPath({ nodes: [], edges: [] });
    }
    closeMenu();
  }, [highlightedPath, closeMenu]);



  const handleToggleOrientation = useCallback(() => {
    setOrientation((currentOrientation) =>
      currentOrientation === 'vertical' ? 'horizontal' : 'vertical'
    );
    
    setTimeout(() => fitView({ duration: 500 }), 100);
  }, [fitView]);

  
 const finalBaseEdges = useMemo(() => {
    if (!hoveredNodeId) return baseEdges;
    return baseEdges.map(edge => {
      if (edge.source === hoveredNodeId || edge.target === hoveredNodeId) {
        return { ...edge, style: { stroke: 'var(--color-primary1)', strokeWidth: 4 }, animated: true };
      }
      return edge;
    });
  }, [hoveredNodeId, baseEdges]);

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
        edges={[...finalBaseEdges, ...lineageEdges]}
        nodes={nodes}
        // edges={finalEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeMouseEnter={(event, node) => setHoveredNodeId(node.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <CustomControls 
          handleResetView={handleResetView}
          handleToggleOrientation={handleToggleOrientation}
        />
        <Legend />
        <CustomMarkers />
         <MiniMap 
          position="bottom-left"
          nodeStrokeWidth={3} 
          zoomable 
          pannable 
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

// This wrapper provides the React Flow context so the inner component can use the hook.
export default function TreeCanvasWrapper(props) {
  return (
    <ReactFlowProvider>
      <TreeCanvasComponent {...props} />
    </ReactFlowProvider>
  );
}



