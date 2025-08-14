// src/components/tree/nodes/FlowPersonNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import PersonCard from '../../PersonCard.jsx';

function FlowPersonNode({ data }) {
  const handleCardClick = () => console.log(`Card clicked for: ${data.name} (ID: ${data.id})`);
  const handleAddClick = (e) => {
    e.stopPropagation();
    console.log(`Add button clicked for: ${data.name}`);
  };
  const handleStyle = { 
    background: 'transparent', 
    border: 'none',
    width: 1,
    height: 1,

  };

  return (
    <div style={{ position: 'relative', padding:'0px', margin:'0px' }}>
      <Handle type="target" position={Position.Top} id="target-parent" style={handleStyle} />
      <Handle type="source" position={Position.Top} id="source-polygamous" style={handleStyle} />
      <Handle type="source" position={Position.Left} id="source-left" style={handleStyle} />
      <Handle type="source" position={Position.Right} id="source-right" style={handleStyle} />
      
      <PersonCard {...data} onClick={handleCardClick} onAdd={handleAddClick} />
      
      <Handle type="source" position={Position.Bottom} id="source-child" style={handleStyle} />
    </div>
  );
}

export default React.memo(FlowPersonNode);