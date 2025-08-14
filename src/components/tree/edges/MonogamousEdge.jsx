import React from 'react';
import { getBezierPath, BaseEdge } from 'reactflow';

// This is the final, simplified version that works with the "junction node" layout.
// Its only job is to draw a clean line from a spouse to the central point.
// The logic for the icon is no longer needed here.

export default function MonogamousEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) {
  // This function calculates the path for a smooth, curved line.
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // BaseEdge is a built-in React Flow component that renders an SVG path with a given style.
  return (
    <BaseEdge 
      path={edgePath} 
      style={{ stroke: 'var(--color-gray)', strokeWidth: 2 }} 
    />
  );
}