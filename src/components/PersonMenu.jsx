// src/components/PersonMenu.jsx
import React, { useEffect, useRef, useState } from 'react';
import usePersonMenuStore from '../store/usePersonMenuStore';
import dataService from '../services/dataService';
import { ListCollapse, CircleUserRound, MapPinHouse, GitCompareArrows, UserRoundPlus, UserRoundPen, Heart, Baby, Users, User, ChevronRight } from 'lucide-react';
import '../styles/PersonMenu.css';

function PersonMenu({ handleToggleCollapse, handleOpenProfile, handleTraceLineage, handleSetAsRoot, onAddSpouse, onAddChild, onAddParent }) {
  const { isOpen, targetNodeId, position, actions, targetPerson } = usePersonMenuStore();
  const menuRef = useRef(null);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const submenuRef = useRef(null);
  const [isSpouse, setIsSpouse] = useState(false)


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

  useEffect(() => {
    let cancelled = false;
    if (!isOpen || !targetNodeId) {
      setIsSpouse(false);
      return;
    }

    dataService
      .getPerson(targetNodeId)
      .then((personModel) => {
        if (cancelled) return;
        if (personModel) {
          setIsSpouse(Boolean(personModel.isSpouse));
        } else if (targetPerson && typeof targetPerson.isSpouse !== 'undefined') {
          setIsSpouse(Boolean(targetPerson.isSpouse));
        } else {
          setIsSpouse(Boolean(targetPerson && targetPerson.variant === 'spouse'));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setIsSpouse(Boolean(targetPerson && targetPerson.variant === 'spouse'));
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, targetNodeId, targetPerson]);

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
    const currentTargetNodeId = targetNodeId;
    actions.closeMenu();
    setShowSubmenu(false);

    if (relativeType === 'spouse') {
      onAddSpouse(currentTargetNodeId);
      console.log('Adding spouse for node:', currentTargetNodeId);

    } else if (relativeType === 'child') {
      onAddChild(currentTargetNodeId);
      console.log('Adding child for node:', currentTargetNodeId);

    } else if (relativeType === 'parent') {
      onAddParent(currentTargetNodeId);
      console.log('Adding parent for node:', currentTargetNodeId);
    } else {
      console.log(`Unknown relative type: ${relativeType}`);
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
            {!isSpouse && (
              <button className="person-menu-item" onClick={() => handleAddRelative('spouse')}>
                <Heart size={15} />
                <span className="person-menu-text">Add Spouse</span>
              </button>
            )}
            <button className="person-menu-item" onClick={() => handleAddRelative('child')}>
              <Baby size={15} />
              <span className="person-menu-text">Add Child</span>
            </button>

            {!isSpouse && (
              <button className="person-menu-item" onClick={() => handleAddRelative('parent')}>
                <Users size={15} />
                <span className="person-menu-text">Add Parent</span>
              </button>
            )}

          </div>
        </div>
      )}
    </>
  );
}

export default PersonMenu;