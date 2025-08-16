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
    // --- YOUR WORKING VERTICAL LAYOUT PATH (UNCHANGED) ---
    const yOffset = -offset;
    if (targetX > sourceX) { // Wife on the right
      edgePath = `M ${sourceX},${sourceY} V ${sourceY + yOffset + borderRadius} A ${borderRadius},${borderRadius} 0 0 1 ${sourceX + borderRadius},${sourceY + yOffset} H ${targetX - borderRadius} A ${borderRadius},${borderRadius} 0 0 1 ${targetX},${sourceY + yOffset + borderRadius} V ${targetY}`;
    } else { // Wife on the left
      edgePath = `M ${sourceX},${sourceY} V ${sourceY + yOffset + borderRadius} A ${borderRadius},${borderRadius} 0 0 0 ${sourceX - borderRadius},${sourceY + yOffset} H ${targetX + borderRadius} A ${borderRadius},${borderRadius} 0 0 0 ${targetX},${sourceY + yOffset + borderRadius} V ${targetY}`;
    }
  } else {
    // ✨ THE FIX: This is the definitive, correct path for the horizontal layout.
    // It creates a "bridge" line that goes out, then across, then in.
    const xOffset = offset;
    
    const midX = sourceX + xOffset;

    edgePath = 
      `M ${sourceX},${sourceY} ` + // Start at the husband's handle
      `H ${midX - borderRadius} ` + // Go right to the start of the first curve
      `A ${borderRadius},${borderRadius} 0 0 1 ${midX},${sourceY > targetY ? sourceY - borderRadius : sourceY + borderRadius} ` + // First curve (up or down)
      `V ${targetY > sourceY ? targetY - borderRadius : targetY + borderRadius} ` + // Vertical line in the middle
      `A ${borderRadius},${borderRadius} 0 0 0 ${midX + borderRadius},${targetY} ` + // Second curve (up or down)
      `H ${targetX}`; // Go straight to the wife's handle
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