import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Text from './Text';
import Card from '../layout/containers/Card';
import '../styles/Submenu.css';

const Submenu = ({ 
  isOpen, 
  onClose, 
  position = { top: '60px', right: '40px' },
  children,
  className = '',
  title = '',
  showHeader = false
}) => {
  const submenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && submenuRef.current && !submenuRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className={`submenu-container ${className}`}
      style={{
        position: 'fixed',
        top: position.top,
        right: position.right,
        left: position.left,
        zIndex: 2000,
        animation: 'submenuSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      ref={submenuRef}
    >
      <Card
        className="submenu-card"
        padding="0"
        margin="0"
        shadow={true}
        backgroundColor="var(--color-white)"
        borderRadius="12px"
        width="auto"
        minWidth="200px"
      >
        {showHeader && title && (
          <div className="submenu-header">
            <Text variant="caption" bold uppercase className="submenu-title">
              {title}
            </Text>
          </div>
        )}
        <div className="submenu-body">
          {children}
        </div>
      </Card>
    </div>,
    document.body
  );
};

export default Submenu; 