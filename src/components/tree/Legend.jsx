// src/components/tree/Legend.jsx
import React from 'react';

// A small, reusable component for each item in the legend.
const LegendItem = ({ gradient, label }) => {
  const style = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#555',
  };

  const swatchStyle = {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    background: gradient,
  };

  return (
    <div style={style}>
      <div style={swatchStyle}></div>
      <span>{label}</span>
    </div>
  );
};

// The main Legend component.
export default function Legend() {
  const legendContainerStyle = {
    position: 'absolute', // This is the key to overlaying it on the canvas
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)', // Center it horizontally
    zIndex: 10, 
    background: 'rgba(255, 255, 255, 0.8)', 
    borderRadius: '8px',
    padding: '10px 15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column', // Stack items vertically
    gap: '8px',
  };

  const legendItemsContainerStyle = {
    display: 'flex',
    flexDirection: 'row', // Legend items in a row
    gap: '8px',
    flexWrap: 'wrap', // Allow items to wrap if needed
  };

  return (
    <div style={legendContainerStyle}>
      <div style={{ fontWeight: 'bold', alignSelf:'center', fontSize: '13px', marginBottom: '4px' }}>Legend</div>
      <div style={legendItemsContainerStyle}>
        <LegendItem 
          gradient="linear-gradient(135deg, #2D6BFF, #e3edff)" 
          label="Root Node" 
        />
        <LegendItem 
          gradient="linear-gradient(135deg, #3bb273, #f3ede0)" 
          label="Direct Line" 
        />
        <LegendItem 
          gradient="linear-gradient(135deg, #c58c66, #f3e7d3)" 
          label="Spouse" 
        />
        <LegendItem 
          gradient="linear-gradient(135deg, #b0b0b0, #f3ede0)" 
          label="Deceased" 
        />
      </div>
    </div>
  );
}
