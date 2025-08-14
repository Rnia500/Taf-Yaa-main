// src/components/tree/edges/MonogamousEdge.jsx
import React from 'react';
import { getBezierPath, BaseEdge } from 'reactflow';

// ✨ STEP 1: Import your specific SVG file.
// The `?react` suffix is a Vite feature that tells it to load the SVG as a React component.
// The path goes up from `src/components/tree/edges` to the project root.
import MariageUnionIcon from '../../../../public/SVGs/MariageUnion.svg?react';

export default function MonogamousEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g>
      {/* The base grey line connecting the two nodes */}
      <BaseEdge path={edgePath} style={{ stroke: 'var(--color-gray)', strokeWidth: 2 }} />
      
      {/* Container to place your icon exactly in the middle of the line */}
      <foreignObject
        width={32}
        height={32}
        x={labelX - 16} // Center the container horizontally
        y={labelY - 16} // Center the container vertically
        // The style is important to make sure the icon is clickable
        // and doesn't block mouse events for the canvas itself.
        style={{ overflow: 'visible' }} 
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          {/* ✨ STEP 2: Use your imported component here. */}
          <MariageUnionIcon style={{ width: 24, height: 24 }} />
        </div>
      </foreignObject>
    </g>
  );
}