// src/components/tree/nodes/MarriageNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import mariageUnionUrl from '../../../assets/SVGs/MariageUnion.svg';

export default function MarriageNode() {
  // ✨ NEW: Define a smaller, shared style for all handles
  const handleStyle = { 
    background: 'transparent', 
    border: 'none',
    width: 0, 
    height: 0,
    padding:0,
    margin:0
  };

  return (
    <div style={{position: 'relative', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Handle type="target" position={Position.Left} id="target-left" style={handleStyle} />
      <Handle type="target" position={Position.Right} id="target-right" style={handleStyle} />
      
      <img 
        src={mariageUnionUrl} 
        alt="Marriage Union"
        style={{ width: 24, height: 24, padding:0, margin:0 }} 
      />

      <Handle type="source" position={Position.Bottom} id="source-bottom" style={handleStyle} />
    </div>
  );
}