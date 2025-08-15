// src/components/tree/edges/PolygamousEdge.jsx
import React from 'react';

// This is the final, symmetrical version of the polygamous edge.
export default function PolygamousEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
}) {
  const borderRadius = 10;
  const yOffset = -30;
  let edgePath;

  // This is the critical logic. We check if the wife is to the right or left.
  if (targetX > sourceX) {
    // --- WIFE IS ON THE RIGHT SIDE ---
    // This path draws a curve to the RIGHT and then down.
    edgePath = 
      `M ${sourceX},${sourceY} ` + // Move to husband's handle
      `V ${sourceY + yOffset + borderRadius} ` + // Go straight up
      `A ${borderRadius},${borderRadius} 0 0 1 ${sourceX + borderRadius},${sourceY + yOffset} ` + // Create the top-left rounded corner
      `H ${targetX - borderRadius} ` + // Draw the horizontal line
      `A ${borderRadius},${borderRadius} 0 0 1 ${targetX},${sourceY + yOffset + borderRadius} ` + // Create the top-right rounded corner
      `V ${targetY}`; // Go straight down to the wife's handle

  } else {
    // --- WIFE IS ON THE LEFT SIDE ---
    // This path draws a curve to the LEFT and then down.
    edgePath = 
      `M ${sourceX},${sourceY} ` + // Move to husband's handle
      `V ${sourceY + yOffset + borderRadius} ` + // Go straight up
      `A ${borderRadius},${borderRadius} 0 0 0 ${sourceX - borderRadius},${sourceY + yOffset} ` + // Create the top-right rounded corner (note the different sweep-flag '0')
      `H ${targetX + borderRadius} ` + // Draw the horizontal line to the left
      `A ${borderRadius},${borderRadius} 0 0 0 ${targetX},${sourceY + yOffset + borderRadius} ` + // Create the top-left rounded corner
      `V ${targetY}`; // Go straight down to the wife's handle
  }

  return (
    <path
      d={edgePath}
      fill="none"
      stroke="var(--color-gray)"
      strokeWidth={2}
    />
  );
}