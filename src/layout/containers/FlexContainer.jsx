import React from 'react';
import '../../styles/FlexContainer.css';


function FlexContainer({
  children,
  direction = 'column', // or 'column'
  wrap = true,
  width = '100%',
  height = 'auto',
  gap = '16px',
  padding = '16px',
  align = 'flex-start',
  justify = 'flex-start',
  className = '',
  margin = '',
  backgroundColor 
}) {
  return (
    <div
      className={`responsive-container ${direction} ${className}`}
      style={{
        gap,
        padding,
        margin,
        width,
        height,
        flexDirection: direction,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: align,
        justifyContent: justify,
        backgroundColor
      }}
    >
      {children}
    </div>
  );
}

export default FlexContainer;
