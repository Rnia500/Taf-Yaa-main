// src/components/tree/nodes/FlowPersonNodeHorizontal.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import PersonCardHorizontal from '../../PersonCardHorizontal.jsx'; // Make sure this path is correct
import usePersonMenuStore from '../../../store/usePersonMenuStore';

function FlowPersonNodeHorizontal({ id, data }) {
  const { actions } = usePersonMenuStore();

  const handleLeftClick = () => {
    if (data.onOpenProfile) {
      data.onOpenProfile();
    }
  };

  const handleRightClick = (event) => {
    event.preventDefault();
    actions.openMenu(id, { x: event.clientX, y: event.clientY });
  };
  
  const handleStyle = { 
    background: 'transparent', 
    border: 'none',
    width: 1, 
    height: 1,
  };

  return (
    <div 
      style={{ position: 'relative' }}
      onClick={handleLeftClick}
      onContextMenu={handleRightClick}
    >
      {/* Primary handles for parent/child connections in a LEFT-TO-RIGHT layout */}
      <Handle type="target" position={Position.Left} id="target-parent" style={handleStyle} />
      <Handle type="source" position={Position.Right} id="source-child" style={handleStyle} />
      
      {/* ✨ THE FIX: These are the secondary handles for spouse connections in a horizontal layout.
          Their IDs are now corrected to match what the `treeLayout.js` algorithm expects. */}
      <Handle type="source" position={Position.Top} id="source-top" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={handleStyle} />
      
      <PersonCardHorizontal {...data} />
    </div>
  );
}

export default React.memo(FlowPersonNodeHorizontal);