// src/components/tree/TreeCanvas.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import "../../styles/treeCanvas.css";

import { useFamilyData } from "../../hooks/useFamilyData";
import {
  calculateLayout,
  traceLineage,
  filterFamilyByRoot,
} from "../../utils/treeUtils/treeLayout";
import * as treeController from "../../controllers/treeController/treeController";

import MarriageNode from "./nodes/MarriageNode";
import FlowPersonNode from "./nodes/FlowPersonNode";
import FlowPersonNodeHorizontal from "./nodes/FlowPersonNodeHorizontal";
import MonogamousEdge from "./edges/MonogamousEdge";
import PolygamousEdge from "./edges/PolygamousEdge";
import ParentChildEdge from "./edges/ParentChildEdge";

import PersonMenu from "../PersonMenu";
import CustomControls from "./CustomControls";
import Legend from "./Legend";
import AddSpouseModal from "../Add Relatives/Spouse/AddSpouseModal";
import AddChildModal from "../Add Relatives/Child/AddChildModal";

import usePersonMenuStore from "../../store/usePersonMenuStore";
import useSidebarStore from "../../store/useSidebarStore";
import useModalStore from "../../store/useModalStore";
import dataService from "../../services/dataService";
import Button from "../Button";

// ----- React Flow config -----
const nodeTypes = {
  person: FlowPersonNode,
  marriage: MarriageNode,
  personHorizontal: FlowPersonNodeHorizontal,
};
const edgeTypes = {
  monogamousEdge: MonogamousEdge,
  polygamousEdge: PolygamousEdge,
  parentChild: ParentChildEdge,
};

// ----- SVG markers for edges -----
const CustomMarkers = () => (
  <svg>
    <defs>
      <marker
        id="arrow"
        viewBox="0 -5 10 10"
        refX={10}
        refY={0}
        markerWidth={6}
        markerHeight={6}
        orient="auto-start-reverse"
      >
        <path d="M0,-5L10,0L0,5" fill="var(--color-gray)" />
      </marker>
      <marker
        id="circle"
        viewBox="0 0 10 10"
        refX={5}
        refY={5}
        markerWidth={8}
        markerHeight={8}
      >
        <circle
          cx="5"
          cy="5"
          r="3"
          stroke="var(--color-gray)"
          strokeWidth="1.5"
          fill="white"
        />
      </marker>
    </defs>
  </svg>
);

// =======================
// Main Component
// =======================
function TreeCanvasComponent() {
  // ---- Hooks ----
  const { people: allPeople, marriages: allMarriages, loading, reload } =
    useFamilyData("tree001");

  const { fitView } = useReactFlow();
  const { closeMenu } = usePersonMenuStore((state) => state.actions);
  const openProfileSidebar = useSidebarStore((state) => state.openSidebar);
  const { openModal } = useModalStore();

  // ---- State ----
  const [peopleWithCollapseState, setPeopleWithCollapseState] =
    useState(allPeople);
  const [rootPersonId, setRootPersonId] = useState("p001");

  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState({ nodes: [], edges: [] });
  const [lineageEdges, setLineageEdges] = useState([]);

  const [orientation, setOrientation] = useState("vertical");

  // For spouse/child modals
  const [partnerName, setPartnerName] = useState("");
  const [targetNodeId, setTargetNodeId] = useState(null);

  // ---- Derived data (filter people & marriages) ----
  const { visiblePeople, visibleMarriages } = useMemo(() => {
    const peopleWithState = allPeople.map((p) => {
      const stateful = peopleWithCollapseState.find((sp) => sp.id === p.id);
      return stateful || p;
    });

    if (rootPersonId === "p001") {
      return { visiblePeople: peopleWithState, visibleMarriages: allMarriages };
    }
    return filterFamilyByRoot(rootPersonId, peopleWithState, allMarriages);
  }, [rootPersonId, peopleWithCollapseState, allPeople, allMarriages]);


  // ---- Handlers ----
  const handleToggleCollapse = useCallback((personId) => {
    setPeopleWithCollapseState((current) =>
      current.map((p) =>
        p.id === personId ? { ...p, isCollapsed: !p.isCollapsed } : p
      )
    );
  }, []);

  const handleOpenProfile = useCallback(
    (personId) => {
      if (openProfileSidebar) openProfileSidebar(personId);
    },
    [openProfileSidebar]
  );

    // ---- Layout ----
   const { nodes, edges: baseEdges } = useMemo(
    () => calculateLayout(rootPersonId, visiblePeople, visibleMarriages, handleToggleCollapse, handleOpenProfile, orientation),
    [rootPersonId, visiblePeople, visibleMarriages, handleToggleCollapse, handleOpenProfile, orientation]
  );


  const handleTraceLineage = useCallback(
    (personId) => {
      const path = traceLineage(personId, allPeople, allMarriages);
      const highlightedEdges = baseEdges.filter((e) =>
        path.edges.includes(e.id)
      );
      const overlay = highlightedEdges.map((e) => ({
        ...e,
        id: `lineage-${e.id}`,
        style: { stroke: "var(--color-primary1)", strokeWidth: 8 },
        className: "lineage-edge",
      }));
      setLineageEdges(overlay);
    },
    [allPeople, allMarriages, baseEdges]
  );

  const handleSetAsRoot = useCallback((personId) => {
    setRootPersonId(personId);
    setHighlightedPath({ nodes: [], edges: [] });
  }, []);

  const handleResetView = useCallback(() => {
    setRootPersonId("p001");
    setPeopleWithCollapseState((current) =>
      current.map((p) => ({ ...p, isCollapsed: false }))
    );
    setHighlightedPath({ nodes: [], edges: [] });
    closeMenu();
    setTimeout(() => fitView({ duration: 800 }), 50);
  }, [fitView, closeMenu]);

  const clearHighlight = useCallback(() => {
    if (highlightedPath.nodes.length || highlightedPath.edges.length) {
      setHighlightedPath({ nodes: [], edges: [] });
    }
    closeMenu();
  }, [highlightedPath, closeMenu]);

  const handleToggleOrientation = useCallback(() => {
    setOrientation((current) =>
      current === "vertical" ? "horizontal" : "vertical"
    );
    setTimeout(() => fitView({ duration: 500 }), 100);
  }, [fitView]);



  // ---- Edge highlighting on hover ----
  const finalBaseEdges = useMemo(() => {
    if (!hoveredNodeId) return baseEdges;
    return baseEdges.map((e) =>
      e.source === hoveredNodeId || e.target === hoveredNodeId
        ? {
            ...e,
            style: { stroke: "var(--color-primary1)", strokeWidth: 4 },
            animated: true,
          }
        : e
    );
  }, [hoveredNodeId, baseEdges]);

  // ---- Effects ----
  useEffect(() => {
    setPeopleWithCollapseState(allPeople);
  }, [allPeople]);

  if (loading) return <div>Loading family tree…</div>;

  // ---- Child Submit ----
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

  // =======================
  // Render
  // =======================
  return (
    <div
      style={{ height: "100%", width: "100%" }}
      onMouseDown={clearHighlight}
    >
      {/* Context menu for nodes */}
      <PersonMenu
        handleToggleCollapse={handleToggleCollapse}
        handleOpenProfile={handleOpenProfile}
        handleTraceLineage={handleTraceLineage}
        handleSetAsRoot={handleSetAsRoot}
        handleResetView={handleResetView}
        onAddSpouse={(personId) => {
          setTargetNodeId(personId);
          const person = allPeople.find((p) => p.id === personId);
          if (person) setPartnerName(person.name);
          openModal("addSpouseModal", { targetNodeId: personId });
        }}
        onAddChild={(personId) => setTargetNodeId(personId)}
      />

      {/* Modals */}
      <AddSpouseModal
        targetNodeId={targetNodeId}
        partnerName={partnerName}
        onSuccess={() => {
          reload();
          setTargetNodeId(null);
        }}
      />
      <AddChildModal onSubmit={handleAddChildSubmit} />

      {/* Reset button */}
      <Button
        positionType="absolute"
        position="top-left"
        margin="10px 0px 0px 200px"
        variant="danger"
        onClick={() => {
          dataService.clearLocalDB();
          window.location.reload();
        }}
      >
        Reset Family Tree
      </Button>

      {/* React Flow canvas */}
      <ReactFlow
        edges={[...finalBaseEdges, ...lineageEdges]}
        nodes={nodes}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeMouseEnter={(e, node) => setHoveredNodeId(node.id)}
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

// ----- Wrapper -----
export default function TreeCanvasWrapper(props) {
  return (
    <ReactFlowProvider>
      <TreeCanvasComponent {...props} />
    </ReactFlowProvider>
  );
}
