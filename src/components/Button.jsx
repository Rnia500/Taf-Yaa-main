import React from 'react';
import '../styles/Button.css';
import { useState } from 'react';

// Map position prop to its transform value
const positionTransforms = {
  'center': 'translate(-50%, -50%)',
  'left': 'translateY(-50%)',
  'right': 'translateY(-50%)',
  'top-center': 'translateX(-50%)',
  'bottom-center': 'translateX(-50%)',
  // Add more as needed
};

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  borderRadius = '8px',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  margin = '0px',
  type = 'button',
  width,
  positionType = 'static', 
  position = '',           
  style = {},
}) => {
  const classList = ['btn'];
  const [isPressed, setIsPressed] = useState(false);

  // Get the transform for position, if any
  const positionTransform = positionTransforms[position] || '';
  // Get the scale transform
  const scaleTransform = onClick && isPressed ? 'scale(0.9)' : 'scale(1)';
  // Combine them (order: position first, then scale)
  const combinedTransform = [positionTransform, scaleTransform].filter(Boolean).join(' ');

  if (variant) classList.push(`btn-${variant}`);
  if (size) classList.push(`btn-${size}`);
  if (fullWidth) classList.push('btn-full');
  if (loading) classList.push('btn-loading');
  if (borderRadius) classList.push(`btn-radius-${borderRadius}`);
  if (disabled && !loading) classList.push('btn-disabled');
  if (position) classList.push(`btn-pos-${position}`);

  return (
    <button
      onMouseDown={onClick ? () => setIsPressed(true) : undefined }
      onMouseUp={onClick ? () => setIsPressed(false) : undefined }
      type={type}
      className={classList.join(' ')}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: combinedTransform,
        margin,
        ...(width ? { width } : {}),
        position: positionType,
        ...style,
      }}
    >
      {loading ? (
        <>
          <span className="spinner" /> Loading...
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
