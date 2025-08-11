// components/layout/Row.jsx
import React from 'react';
import '../../styles/Row.css';

const Row = ({
  children,
  gap = '1rem',
  padding = '1rem',
  margin = "0px",
  width = '100%',
  justifyContent = 'center',
  alignItems = 'center',
  style,
  fitContent = false, 
}) => {
  return (
    <div
      className="layout-row"
      style={{
        gap,
        width,
        margin,
        padding,
        alignItems,
        justifyContent,
        ...style,
      }}
    >
      {React.Children.map(children, child => {
        const hasFixedWidth =
          child?.props?.style?.width ||
          child?.props?.width ||
          child?.props?.className?.includes('fixed');

        // Center the child inside its flex cell
        return (
          <div
            style={{
              flex: fitContent ? 'initial' : (hasFixedWidth ? 'initial' : 1),
              display: 'flex',
              justifyContent: 'center', 
              alignItems: 'center',     
              height: '100%',
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default Row;
