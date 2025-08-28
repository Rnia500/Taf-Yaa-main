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
import { calculateLayout, traceLineage, filterFamilyByRoot } from '../../utils/treeUtils/treeLayout';
import * as treeController from '../../controllers/treeController/treeController'; // ✅ fixed import
import MarriageNode from './nodes/MarriageNode';
import FlowPersonNode from './nodes/FlowPersonNode';
import FlowPersonNodeHorizontal from './nodes/FlowPersonNodeHorizontal';
import MonogamousEdge from './edges/MonogamousEdge';
import PolygamousEdge from './edges/PolygamousEdge';
import ParentChildEdge from './edges/ParentChildEdge';
import PersonMenu from '../PersonMenu';
import CustomControls from './CustomControls';
import Legend from './Legend';
import AddSpouseModal from '../Add Relatives/Spouse/AddSpouseModal';
import AddChildModal from '../Add Relatives/Child/AddChildModal';
import usePersonMenuStore from '../../store/usePersonMenuStore';
import useSidebarStore from '../../store/useSidebarStore';
import useModalStore from '../../store/useModalStore';
import dataService from '../../services/dataService';
import Button from '../Button';

const nodeTypes = { person: FlowPersonNode, marriage: MarriageNode, personHorizontal: FlowPersonNodeHorizontal };
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

function TreeCanvasComponent() {
  const { people: allPeople, marriages: allMarriages, loading, reload } = useFamilyData("tree001");

  const [peopleWithCollapseState, setPeopleWithCollapseState] = useState(allPeople);
  const [rootPersonId, setRootPersonId] = useState('p001');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState({ nodes: [], edges: [] });
  const [lineageEdges, setLineageEdges] = useState([]);

  const [partnerName, setPartnerName] = useState(''); // State for partner's name
  const [targetNodeId, setTargetNodeId] = useState(null);

  const { closeMenu } = usePersonMenuStore((state) => state.actions);
  const openProfileSidebar = useSidebarStore((state) => state.openSidebar);
  const { openModal } = useModalStore();

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

  const handleTraceLineage = useCallback((personId) => {
    const path = traceLineage(personId, allPeople, allMarriages);
    const highlightedBaseEdges = baseEdges.filter(edge => path.edges.includes(edge.id));
    const animatedOverlay = highlightedBaseEdges.map(edge => ({
      ...edge,
      id: `lineage-${edge.id}`,
      style: { stroke: "var(--color-primary1)", strokeWidth: 8 },
      className: 'lineage-edge',
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

  // spouse submit
  const handleAddSpouseSubmit = async (formData) => {
    try {
      if (!targetNodeId) return;
      await treeController.addSpouse("tree001", targetNodeId, formData);
      setTargetNodeId(null);
      reload();
    } catch (err) {
      console.error("Error adding spouse:", err);
    }
  };

  // child submit
  const handleAddChildSubmit = async (formData) => {
    try {
      if (!targetNodeId) return;
      await treeController.addChild("tree001", {
        parentId: targetNodeId,
        childData: formData,
      });
      reload();
      setTargetNodeId(null);
    } catch (err) {
      console.error("Error adding child:", err);
    }
  };



  return (
    <div style={{ height: '100%', width: '100%' }} onMouseDown={clearHighlight}>
      <PersonMenu
        handleToggleCollapse={handleToggleCollapse}
        handleOpenProfile={handleOpenProfile}
        handleTraceLineage={handleTraceLineage}
        handleSetAsRoot={handleSetAsRoot}
        handleResetView={handleResetView}
        onAddSpouse={(personId) => {
          console.log('onAddSpouse called with:', personId);
          setTargetNodeId(personId);

          // find person by ID and store their name
          const person = allPeople.find(p => p.id === personId);
          if (person) {
            setPartnerName(person.name);
          }

          // Open the modal using the Zustand store
          openModal('addSpouseModal', { targetNodeId: personId });
        }}
        onAddChild={(personId) => { setTargetNodeId(personId); }}
      />

      <AddSpouseModal
        targetNodeId={targetNodeId}
        partnerName={partnerName}
        onSuccess={handleAddSpouseSubmit}
      />

      <AddChildModal
        onSubmit={handleAddChildSubmit}
      />

      <Button positionType='absolute' position='top-left' margin='10px 0px 0px 200px' variant='danger'  onClick={() => {
        dataService.clearLocalDB();
        window.location.reload();
      }}>
        Reset Family Tree
      </Button>


      <ReactFlow
        edges={[...finalBaseEdges, ...lineageEdges]}
        nodes={nodes}
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
        <MiniMap position="bottom-left" nodeStrokeWidth={3} zoomable pannable />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default function TreeCanvasWrapper(props) {
  return (
    <ReactFlowProvider>
      <TreeCanvasComponent {...props} />
    </ReactFlowProvider>
  );
}
