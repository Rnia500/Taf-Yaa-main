import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link, useParams, useLocation } from 'react-router-dom';
import Row from '../../layout/containers/Row';
import ImageCard from '../../layout/containers/ImageCard';
import Text from '../Text';
import { useTranslation } from "react-i18next";

import {
  CircleUser,
  Menu,
  X,
  EarthIcon,
 
  Settings,
  Bell, Trash2,
  ArrowDownToLine, User, LogOut, Shield
} from 'lucide-react';
import Card from '../../layout/containers/Card';
import '../../styles/Navbar.css';
import useModalStore from '../../store/useModalStore';
import { NavLink } from "react-router-dom";
import LanguageMenu from '../LanguageMenu';
import dataService from '../../services/dataService';


export default function AdminNavbar() {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { treeId } = useParams();
  const location = useLocation();
  const submenuRef = useRef(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { t } = useTranslation();


  // Extract treeId from URL if not available from useParams
  const getTreeId = () => {
    if (treeId) {
      // Store the current treeId in localStorage for persistence
      localStorage.setItem('currentTreeId', treeId);
      return treeId;
    }
    
    // Try to extract treeId from current pathname
    const pathMatch = location.pathname.match(/\/family-tree\/([^\/]+)/);
    if (pathMatch) {
      const extractedTreeId = pathMatch[1];
      localStorage.setItem('currentTreeId', extractedTreeId);
      return extractedTreeId;
    }
    
    // Try to get from localStorage (persisted from previous navigation)
    const storedTreeId = localStorage.getItem('currentTreeId');
    if (storedTreeId) {
      return storedTreeId;
    }
    
    // Final fallback: use default
    return 'tree001';
  };

  const currentTreeId = getTreeId();
  

  const toggleSubmenu = () => setSubmenuOpen(prev => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeSubmenu = () => setSubmenuOpen(false);

  // Removed isNavItemActive function to use NavLink's built-in active state handling

  // Submenu items with proper functionality
  const submenuItems = [
    { 
      label: 'Profile', 
      icon: User, 
      href: '/profile',
      action: () => {
        closeSubmenu();
        // Navigate to profile or open profile modal
      }
    },
    { 
      label: 'Notifications', 
      icon: Bell, 
      href: `/family-tree/${currentTreeId}/notifications`,
      action: () => {
        closeSubmenu();
        // Navigate to notifications
      }
    },
    { 
      label: 'Settings', 
      icon: Settings, 
      href: '/settings',
      action: () => {
        closeSubmenu();
        // Navigate to settings
      }
    },
    { 
      label: 'Log Out', 
      icon: LogOut, 
      action: () => {
        closeSubmenu();
        // Handle logout logic
        alert('Logout functionality would go here');
      }
    }
  ];

  const { openModal } = useModalStore();

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target)) {
        setSubmenuOpen(false);
      }
    };

    if (submenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [submenuOpen]);

  const navItems = [
    { label: 'Tree View', href: `/family-tree/${currentTreeId}` },
    { label: 'Members', href: '/members' },
    { label: 'Notification', href: `/family-tree/${currentTreeId}/notifications` },
    { label: 'Suggestions', href: `/family-tree/${currentTreeId}/suggestions` },
  ];

  const MobileNavItems = [
    { label: 'Tree View', href: `/family-tree/${currentTreeId}` },
    { label: 'Members', href: '/members' },
    { label: 'Notification', href: `/family-tree/${currentTreeId}/notifications` },
    { label: 'Suggestions', href: `/family-tree/${currentTreeId}/suggestions` },
    { label: 'Export', action: () => openModal('pdfExportModal') },
    { label: 'Deleted Persons', href: `/family-tree/${currentTreeId}/deleted-persons` },
    { label: 'Settings', href: '/settings' },
    { label: 'Language', href: '/language' },
  ];

  return (
    <nav className="NavBar" >

      {/* Logo Section */}
      <Row padding='0px' margin='0px' fitContent justifyContent='space-between'>
        <div className="logo-section">
          <ImageCard image='/Images/Logo.png' size={45} rounded margin='0px' />
          <Text variant='heading2' className="brand-text">Taf'Yaa</Text>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav">
          <Row width='100%' fitContent={true} gap='0.5rem' padding='0px' margin='0px' className='navbar-row'>
            <div className="nav-items-container">
              {navItems.map((item) => (
                item.action ? (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className='navItem'
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <Text variant='body1' bold>
                      {item.label}
                    </Text>
                  </button>
                ) : (
                  <NavLink 
                    key={item.label} 
                    to={item.href} 
                    end={item.label === 'Tree View'}
                    className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`}
                  >
                    <Text variant='body1' bold>
                      {item.label}
                    </Text>
                  </NavLink>
                )
              ))}
            </div>

            <div className="action-buttons">
              <Link to={`/family-tree/${currentTreeId}/deleted-persons`}>
                <div className="action-btn">
                  <Trash2 size={20} color="var(--color-primary-text)" />
                </div>
              </Link>

              <div className="action-btn" onClick={() => setLangMenuOpen((prev) => !prev)}>
                <EarthIcon size={20} color="var(--color-primary-text)" />
              </div>

              {langMenuOpen &&
         ReactDOM.createPortal(
        <LanguageMenu isOpen={langMenuOpen} onClose={() => setLangMenuOpen(false)} />,
        document.body
        )
      }

              <div className="action-btn" onClick={() => openModal('pdfExportModal')}>
                <ArrowDownToLine size={20} color="var(--color-primary-text)"  />
              </div>

              <div className="action-btn" onClick={toggleSubmenu} ref={submenuRef}>
                <CircleUser size={20} color="var(--color-primary-text)" />
              </div>
            </div>
          </Row>
        </div>
      </Row>

      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary-text)" }}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && ReactDOM.createPortal(
        <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
              {MobileNavItems.map((item) => (
                item.action ? (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.action();
                      closeMobileMenu();
                    }}
                    className="mobile-nav-item"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    {item.label}
                  </button>
                ) : (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    end={item.label === 'Tree View'}
                    className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </NavLink>
                )
              ))}
          </div>
        </div>,
        document.body
      )}

      {/* Submenu Portal */}
      {submenuOpen && ReactDOM.createPortal(
        <div className="submenu">
          {submenuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.label}
                className="submenuItem"
                onClick={item.action}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <IconComponent size={18} />
                <Text variant="body2" style={{ fontWeight: 500 }}>
                  {item.label}
                </Text>
              </div>
            );
          })}
        </div>,
        document.body
      )}

    </nav>
  );
}
