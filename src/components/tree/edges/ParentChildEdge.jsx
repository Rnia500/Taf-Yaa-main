// src/components/tree/edges/ParentChildEdge.jsx
import React from 'react';
import { getBezierPath, BaseEdge, useReactFlow } from 'reactflow';

// This is the final, interactive version of the component.
export default function ParentChildEdge({
  source, // The ID of the parent node
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerStart,
  markerEnd,
}) {
  const { getNodes, setNodes } = useReactFlow();

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // ✨ This function is called when the user clicks the circle marker.
  const onCollapseClick = (event) => {
    event.stopPropagation(); // Prevents the canvas from being dragged

    // --- This is where the magic happens ---
    // In a real app, you would call a function to update Firebase.
    // For our dummy data, we will simulate this by directly changing the node data.
    
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === source) {
          // Find the source node and toggle its `isCollapsed` data property
          return {
            ...node,
            data: {
              ...node.data,
              isCollapsed: !node.data.isCollapsed,
            },
          };
        }
        return node;
      })
    );

    console.log(`Toggled collapse for node: ${source}`);
  };

  return (
    // We use an SVG group <g> to group the edge and the clickable area.
    <g>
      <BaseEdge 
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={{ stroke: 'var(--color-gray)', strokeWidth: 2 }} 
      />
      {/* 
        This is an invisible rectangle placed over the circle marker.
        It's slightly larger than the circle, making it much easier to click.
      */}
      <rect
        x={sourceX - 8}
        y={sourceY - 8}
        width={16}
        height={16}
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onClick={onCollapseClick}
      />
    </g>
  );
}