import React from 'react';


export default function PolygamousEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
}) {
  // Define how high above the nodes the line should go
  const yOffset = -30;

  // Create the custom SVG path string:
  // M = Move To (start)
  // V = Vertical Line To (go up)
  // H = Horizontal Line To (go across)
  // V = Vertical Line To (go down to target)
  const edgePath = `M ${sourceX},${sourceY} V ${sourceY + yOffset} H ${targetX} V ${targetY}`;

  return (
    <path
      d={edgePath}
      fill="none"
      stroke="var(--color-gray)"
      strokeWidth={2}
    />
  );
}