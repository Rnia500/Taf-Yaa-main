// src/components/PersonMenu.jsx
import React, { useEffect, useRef, useState } from 'react';
import usePersonMenuStore from '../store/usePersonMenuStore';
import useModalStore from '../store/useModalStore';
import { ListCollapse, CircleUserRound , MapPinHouse, GitCompareArrows, UserRoundPlus, UserRoundPen, Heart, Baby, Users, User, ChevronRight  } from 'lucide-react';
import '../styles/PersonMenu.css';

function PersonMenu({ handleToggleCollapse, handleOpenProfile, handleTraceLineage, handleSetAsRoot }) {
  const { isOpen, targetNodeId, position, actions } = usePersonMenuStore();
  const menuRef = useRef(null);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const submenuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      const isClickOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);
      const isClickOutsideSubmenu = !showSubmenu || (submenuRef.current && !submenuRef.current.contains(event.target));
      
      if (isClickOutsideMenu && isClickOutsideSubmenu) {
        actions.closeMenu();
        setShowSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, actions, showSubmenu]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showSubmenu) {
          setShowSubmenu(false);
        } else {
          actions.closeMenu();
        }
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, actions, showSubmenu]);

  useEffect(() => {
    if (!isOpen) {
      setShowSubmenu(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onCollapse = () => {
    if (targetNodeId) handleToggleCollapse(targetNodeId);
    actions.closeMenu();
    setShowSubmenu(false);
  };

  const onOpenProfile = () => {
    if (targetNodeId) handleOpenProfile(targetNodeId);
    actions.closeMenu();
    setShowSubmenu(false);
  };
  
  const onTraceLineage = () => {
    if (targetNodeId && handleTraceLineage) {
        handleTraceLineage(targetNodeId);
    }
    actions.closeMenu();
    setShowSubmenu(false);
  };

  const onSetAsRoot = () => {
    if (targetNodeId && handleSetAsRoot) {
      handleSetAsRoot(targetNodeId);
    }
    actions.closeMenu();
    setShowSubmenu(false);
  };

  const handleAddRelative = (relativeType) => {
    if (relativeType === 'spouse') {
      // Close the menu first
      actions.closeMenu();
      setShowSubmenu(false);
      
      // Open the modal using the modal store
      useModalStore.getState().openModal('addSpouseModal');
    } else {
      console.log(`Adding ${relativeType} for node ${targetNodeId}`);
      actions.closeMenu();
      setShowSubmenu(false);
    }
  };

  const toggleSubmenu = () => {
    setShowSubmenu(!showSubmenu);
  };

  const submenuPosition = {
    top: position.y + 150,
    left: position.x + 113
  };

  return (
    <>
      <div
        ref={menuRef}
        className="person-menu"
        style={{
          position: 'fixed',
          top: position.y,
          left: position.x,
          zIndex: 10000,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="person-menu-header">
          <div className="person-menu-title">Actions</div>
        </div>
        
        <div className="person-menu-items">
          <button className="person-menu-item" onClick={onCollapse}>
            <ListCollapse size={15} />
            <span className="person-menu-text">Collapse / Expand</span>
          </button>
          <button className="person-menu-item" onClick={onOpenProfile}>
            <CircleUserRound size={15} />
            <span className="person-menu-text">Open Profile</span>
          </button>
          <button className="person-menu-item" onClick={onTraceLineage}>
              <MapPinHouse size={15} />
              <span className="person-menu-text">Trace Lineage</span>
          </button>
          <button className="person-menu-item" onClick={onSetAsRoot}>
            <GitCompareArrows size={15} />
            <span className="person-menu-text">Set as Root</span>
          </button>
          <button className="person-menu-item" onClick={toggleSubmenu}>
            <UserRoundPlus size={15} />
            <span className="person-menu-text">Add Relative</span>
            <ChevronRight style={{ marginLeft: 'auto' }} size={15} />
          </button>
          <button className="person-menu-item" onClick={() => { actions.closeMenu(); setShowSubmenu(false); }}>
            <UserRoundPen size={15} />
            <span className="person-menu-text">Edit Person</span>
          </button>
        </div>
      </div>

      {showSubmenu && (
        <div
          ref={submenuRef}
          className="person-menu person-submenu"
          style={{
            position: 'fixed',
            top: submenuPosition.top,
            left: submenuPosition.left,
            zIndex: 10001,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="person-menu-header">
            <div className="person-menu-title">Add Relative</div>
          </div>
          
          <div className="person-menu-items">
            <button className="person-menu-item" onClick={() => handleAddRelative('spouse')}>
              <Heart size={15} />
              <span className="person-menu-text">Add Spouse</span>
            </button>
            <button className="person-menu-item" onClick={() => handleAddRelative('child')}>
              <Baby size={15} />
              <span className="person-menu-text">Add Child</span>
            </button>
            <button className="person-menu-item" onClick={() => handleAddRelative('parent')}>
              <Users size={15} />
              <span className="person-menu-text">Add Parent</span>
            </button>
            <button className="person-menu-item" onClick={() => handleAddRelative('sibling')}>
              <User size={15} />
              <span className="person-menu-text">Add Sibling</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PersonMenu;