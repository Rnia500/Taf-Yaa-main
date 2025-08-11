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
  style,
}) => {
  const columnStyle = responsive
    ? { gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }
    : { gridTemplateColumns: `repeat(${columns}, 1fr)` };

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
          <div style={{ width: hasFixedWidth ? 'auto' : '100%' }}>
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default Grid;
