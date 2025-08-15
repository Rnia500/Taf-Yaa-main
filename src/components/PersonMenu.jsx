// src/components/PersonMenu.jsx
import React, { useEffect, useRef } from 'react';
import usePersonMenuStore from '../store/usePersonMenuStore';
import '../styles/PersonMenu.css';

function PersonMenu({ handleToggleCollapse, handleOpenProfile, handleTraceLineage }) {
  const { isOpen, targetNodeId, position, actions } = usePersonMenuStore();
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        actions.closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, actions]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') actions.closeMenu();
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, actions]);

  if (!isOpen) return null;

  const onCollapse = () => {
    if (targetNodeId) handleToggleCollapse(targetNodeId);
    actions.closeMenu();
  };

  const onOpenProfile = () => {
    if (targetNodeId) handleOpenProfile(targetNodeId);
    actions.closeMenu();
  };
  
  const onTraceLineage = () => {
    if (targetNodeId && handleTraceLineage) {
        handleTraceLineage(targetNodeId);
    }
    actions.closeMenu();
  };

  return (
    <div
      ref={menuRef}
      className="person-menu"
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 10000,
      }}
      // ✨ THE FIX: This stops the click from bubbling up to the canvas wrapper.
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="person-menu-header">
        <div className="person-menu-title">Actions</div>
      </div>
      
      <div className="person-menu-items">
        <button className="person-menu-item" onClick={onCollapse}>
          <svg className="person-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
          </svg>
          <span className="person-menu-text">Collapse / Expand</span>
        </button>
        <button className="person-menu-item" onClick={onOpenProfile}>
          <svg className="person-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="person-menu-text">Open Profile</span>
        </button>
        <button className="person-menu-item" onClick={onTraceLineage}>
            <svg className="person-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="person-menu-text">Trace Lineage</span>
        </button>
        <button className="person-menu-item" onClick={() => actions.closeMenu()}>
          <svg className="person-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="person-menu-text">Add Relative...</span>
        </button>
      </div>
    </div>
  );
}

export default PersonMenu;