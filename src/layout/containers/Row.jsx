// components/layout/Row.jsx
import React from 'react';
import '../../styles/Row.css';

const Row = ({
  children,
  gap = '1rem',
  padding = '1rem',
  margin = "0px",
  width = '100%',
  maxWidth,
  justifyContent = 'center',
  alignItems = 'center',
  style,
  fitContent = false,
  fitContentJustifyContent = 'center',
  fitContentAlignItems = 'center',
  // className = '',
}) => {
  return (
    <div
      className={`layout-row`}
      style={{
        gap,
        width,
        maxWidth,
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

        // Align the child inside its flex cell based on fitContent settings
        return (
          <div
            style={{
              flex: fitContent ? 'initial' : (hasFixedWidth ? 'initial' : 1),
              display: 'flex',
              justifyContent: fitContent ? fitContentJustifyContent : justifyContent, 
              alignItems: fitContent ? fitContentAlignItems : 'center',     
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
