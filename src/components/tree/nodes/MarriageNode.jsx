// src/components/tree/nodes/MarriageNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import mariageUnionUrl from '../../../assets/SVGs/MariageUnion.svg';

export default function MarriageNode({ data }) {
  const iconSize = 24;
  const stemWidth = 2;

  const hasChildren = data && data.hasChildren;
  
  const stemLength = hasChildren ? 50 : 0;

  const handleStyle = { 
    background: 'transparent', 
    border: 'none',
    width: 1, 
    height: 1,
  };

  const nodeWidth = iconSize;
  const nodeHeight = iconSize + stemLength;

  return (
    <div style={{ position: 'relative', width: nodeWidth, height: nodeHeight }}>
      <div style={{ position: 'relative', width: iconSize, height: iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Handle type="target" position={Position.Left} id="target-left" style={handleStyle} />
        <Handle type="target" position={Position.Right} id="target-right" style={handleStyle} />
        <img src={mariageUnionUrl} alt="Marriage Union" style={{ width: iconSize, height: iconSize }} />
      </div>

      {/* ✨ STEP 4: Conditionally render the stem AND the bottom handle. */}
      {/* They will only be created in the DOM if `hasChildren` is true. */}
      {hasChildren && (
        <>
          <div 
            style={{ 
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: iconSize,
              width: stemWidth, 
              height: stemLength, 
              backgroundColor: 'var(--color-gray)' 
            }} 
          />
          <Handle type="source" position={Position.Bottom} id="source-bottom" style={handleStyle} />
        </>
      )}
    </div>
  );
}