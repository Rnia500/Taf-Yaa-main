import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import Row from '../../layout/containers/Row';
import ImageCard from '../../layout/containers/ImageCard';
import Text from '../Text';
import { useTranslation } from "react-i18next";
import Submenu from '../Submenu';

import {
  CircleUser,
  Menu,
  X,
  EarthIcon,
  Settings,
  Bell, Trash2,
  ArrowDownToLine, User, LogOut, Shield, TreePine
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
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const { treeId } = useParams();
  const location = useLocation();
  const submenuRef = useRef(null);
  const langMenuRef = useRef(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Extract treeId from URL if not available from useParams
  const getTreeId = () => {
    if (treeId) {
      localStorage.setItem('currentTreeId', treeId);
      return treeId;
    }

    const pathMatch = location.pathname.match(/\/family-tree\/([^\/]+)/);
    if (pathMatch) {
      const extractedTreeId = pathMatch[1];
      localStorage.setItem('currentTreeId', extractedTreeId);
      return extractedTreeId;
    }

    const storedTreeId = localStorage.getItem('currentTreeId');
    if (storedTreeId) {
      return storedTreeId;
    }

    return 'tree001';
  };

  const currentTreeId = getTreeId();

  const toggleSubmenu = () => {
    setSubmenuOpen(prev => !prev);
    setLangMenuOpen(false);
    setActiveButton(prev => prev === 'profile' ? null : 'profile');
  };

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeSubmenu = () => {
    setSubmenuOpen(false);
    setActiveButton(null);
  };

  const toggleLanguageMenu = () => {
    setLangMenuOpen(prev => !prev);
    setSubmenuOpen(false);
    setActiveButton(prev => prev === 'language' ? null : 'language');
  };

  const closeLanguageMenu = () => {
    setLangMenuOpen(false);
    setActiveButton(null);
  };

  // Handle clicking on the language button when menu is open (should close it)
  const handleLanguageButtonClick = () => {
    if (langMenuOpen) {
      closeLanguageMenu();
    } else {
      toggleLanguageMenu();
    }
  };

  // Submenu items with proper functionality
  const submenuItems = [
    {
      label: t('navbar.profile'),
      icon: User,
      href: '/profile',
      action: () => {
        closeSubmenu();
      }
    },
    {
      label: t('navbar.notifications'),
      icon: Bell,
      href: `/family-tree/${currentTreeId}/notificationcenter`,
      action: () => {
        closeSubmenu();
      }
    },
    {
      label: t('navbar.settings'),
      icon: Settings,
      href: '/settings',
      action: () => {
        closeSubmenu();
      }
    },
    {
      label: 'My Trees',
      icon: TreePine,
      href: '/my-trees',
      action: () => {
        closeSubmenu();
        navigate('/my-trees');
      }
    },
    {
      label: t('navbar.log_out'),
      icon: LogOut,
      action: () => {
        closeSubmenu();
        alert('Logout functionality would go here');
      }
    }
  ];

  const { openModal } = useModalStore();

  const navItems = [
    { label: t('navbar.tree_view'), href: `/family-tree/${currentTreeId}` },
    { label: t('navbar.members'), href: '/members' },
    { label: t('navbar.notification_center'), href: `/family-tree/${currentTreeId}/notificationcenter` },
  ];

  const MobileNavItems = [
    { label: t('navbar.tree_view'), href: `/family-tree/${currentTreeId}` },
    { label: t('navbar.members'), href: '/members' },
    { label: t('navbar.notification_center'), href: `/family-tree/${currentTreeId}/notificationcenter` },
    { label: t('navbar.export'), action: () => openModal('pdfExportModal') },
    { label: t('navbar.deleted_persons'), href: `/family-tree/${currentTreeId}/deleted-persons` },
    { label: t('navbar.settings'), href: '/settings' },
    { label: t('navbar.language'), href: '/language' },
  ];

  return (
    <nav className="NavBar">
      {/* Logo Section */}
      <Row padding='0px' margin='0px' fitContent justifyContent='space-between'>
        <div className="logo-section">
          <ImageCard image='/Images/Logo.png' size={45} rounded margin='0px' />
          <Text variant='heading2' className="brand-text">{t('navbar.brand_name')}</Text>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav">
          <Row width='100%' fitContent={true} gap='0.5rem' padding='0px' margin='0px' className='navbar-row'>
            <div className="nav-items-container">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  end={item.label === t('navbar.tree_view')}
                  className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`}
                >
                  <Text variant='body1' bold>
                    {item.label}
                  </Text>
                </NavLink>
              ))}
            </div>

            <div className="action-buttons">
              <NavLink
                to={`/family-tree/${currentTreeId}/deleted-persons`}
                className={({ isActive }) => `action-btn ${isActive ? 'active' : ''}`}
              >
                <Trash2 size={20} color="var(--color-primary-text)" />
              </NavLink>

              <div
                className={`action-btn ${activeButton === 'language' ? 'active' : ''}`}
                onClick={handleLanguageButtonClick}
                ref={langMenuRef}
              >
                <EarthIcon size={20} color="var(--color-primary-text)" />
              </div>

              <LanguageMenu
                isOpen={langMenuOpen}
                onClose={closeLanguageMenu}
                triggerRef={langMenuRef}
              />

              <div className="action-btn" onClick={() => openModal('pdfExportModal')}>
                <ArrowDownToLine size={20} color="var(--color-primary-text)"  />
              </div>

              <div
                className={`action-btn ${activeButton === 'profile' ? 'active' : ''}`}
                onClick={toggleSubmenu}
                ref={submenuRef}
              >
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
                    end={item.label === t('navbar.tree_view')}
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

      {/* Profile Submenu */}
      <Submenu
        isOpen={submenuOpen}
        onClose={closeSubmenu}
        className="profile-submenu"
        position={{ top: '60px', right: '40px' }}
      >
        {submenuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Card
              key={item.label}
              onClick={item.action}
              className="submenu-item-card"
              padding="0.75rem"
              margin="0"
              backgroundColor="transparent"
              borderColor="transparent"
              borderRadius="8px"
              width="100%"
              height="auto"
            >
              <div className="submenu-item-content">
                <IconComponent size={18} />
                <Text variant="body2" style={{ fontWeight: 500 }}>
                  {item.label}
                </Text>
              </div>
            </Card>
          );
        })}
      </Submenu>
    </nav>
  );
}
