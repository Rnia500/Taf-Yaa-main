// src/components/tree/edges/PolygamousEdge.jsx
import React from 'react';

export default function PolygamousEdge({
  sourceX, sourceY, targetX, targetY,
  markerStart, markerEnd,
  data 
}) {
  const borderRadius = 10;
  const offset = 30; 
  let edgePath;

  const orientation = data?.orientation || 'vertical';

  if (orientation === 'vertical') {
    // ✅ Existing working vertical path (unchanged)
    const yOffset = -offset;
    if (targetX > sourceX) { // Wife on the right
      edgePath = `M ${sourceX},${sourceY} 
        V ${sourceY + yOffset + borderRadius} 
        A ${borderRadius},${borderRadius} 0 0 1 ${sourceX + borderRadius},${sourceY + yOffset} 
        H ${targetX - borderRadius} 
        A ${borderRadius},${borderRadius} 0 0 1 ${targetX},${sourceY + yOffset + borderRadius} 
        V ${targetY}`;
    } else { // Wife on the left
      edgePath = `M ${sourceX},${sourceY} 
        V ${sourceY + yOffset + borderRadius} 
        A ${borderRadius},${borderRadius} 0 0 0 ${sourceX - borderRadius},${sourceY + yOffset} 
        H ${targetX + borderRadius} 
        A ${borderRadius},${borderRadius} 0 0 0 ${targetX},${sourceY + yOffset + borderRadius} 
        V ${targetY}`;
    }
  }  else {
    // ✨ THE FIX: This is the definitive, correct manual SVG path for a horizontal bridge.
    // It creates the clean "bus" line you designed.
    
    const xOffset = offset;
    const busLineX = sourceX + xOffset;

    // Determine the direction of the curve from the bus line to the wife
    const yCurveDirection = targetY > sourceY ? 1 : 0;

    edgePath = `
      M ${sourceX},${sourceY}
      H ${busLineX}
      V ${targetY > sourceY ? targetY - borderRadius : targetY + borderRadius}
      A ${borderRadius},${borderRadius} 0 0 ${yCurveDirection} ${busLineX + borderRadius},${targetY}
      H ${targetX}
    `;
  }
  return (
    <path
      d={edgePath}
      fill="none"
      stroke="var(--color-gray)"
      strokeWidth={2}
      markerStart={markerStart}
      markerEnd={markerEnd}
    />
  );
}
