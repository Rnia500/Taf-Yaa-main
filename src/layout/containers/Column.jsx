// components/layout/Column.jsx
import React from 'react';
import '../../styles/Column.css';

const Column = ({
  children,
  gap = '1rem',
  padding = '1rem',
  wrap = true,
  width = '100%',
  height = 'auto',
  fitContent = false, 
  justifyContent = 'flex-start',
  alignItems = 'flex-start',
  style,
}) => {
  return (
    <div
      className="layout-column"
      style={{
        gap,
        padding,
        width,
        height,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        justifyContent,
        alignItems,
        ...style,
      }}
    >
      {React.Children.map(children, (child) => {

        const flexValue = fitContent ? '0 0 auto' : '1';
        
        return (
          <div
            style={{
              flex: flexValue,
              width: fitContent ? 'auto' : '100%',
              boxSizing: 'border-box'
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default Column;
