// components/layout/Grid.jsx
import React from 'react';
import '../../styles/Grid.css';

const Grid = ({
  children,
  columns = 3,
  gap = '1rem',
  width = '100%',
  height = 'auto',
  padding = '0px',
  responsive = true,
  fitContent = false,
  cellWidth,
  cellHeight,
  style,
}) => {
  let columnStyle;
  if (fitContent) {
    columnStyle = { gridTemplateColumns: `repeat(auto-fit, minmax(min-content, max-content))` };
  } else if (responsive) {
    columnStyle = { gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` };
  } else {
    columnStyle = { gridTemplateColumns: `repeat(${columns}, 1fr)` };
  }

  return (
    <div
      className={`layout-grid ${responsive ? 'responsive-grid' : ''}`}
      style={{
        ...columnStyle,
        gap,
        width,
        height,
        padding,
        ...style,
      }}
    >
      {React.Children.map(children, (child) => {
        const hasFixedWidth =
          child?.props?.style?.width ||
          child?.props?.width ||
          child?.props?.className?.includes('fixed');

        return (
          <div style={{
            width: cellWidth || (hasFixedWidth ? 'auto' : '100%'),
            height: cellHeight,
          }}>
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default Grid;
