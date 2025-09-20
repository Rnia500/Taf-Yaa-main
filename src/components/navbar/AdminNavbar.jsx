import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Row from '../../layout/containers/Row';
import ImageCard from '../../layout/containers/ImageCard';
import Text from '../Text';
import { useTranslation } from "react-i18next";

import {
  CircleUser,
  Menu,
  X,
  EarthIcon,
  ChevronDown,
  Settings,
  Bell,
  ArrowDownToLine
} from 'lucide-react';
import Card from '../../layout/containers/Card';
import '../../styles/Navbar.css';

import useModalStore from '../../store/useModalStore';
import { NavLink } from "react-router-dom";
import LanguageMenu from '../LanguageMenu';


export default function AdminNavbar() {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleSubmenu = () => setSubmenuOpen(prev => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navItems = [
  { label: t("navbar.tree_view"), href: "#content" },
  { label: t("navbar.members"), href: "#content" },
  { label: t("navbar.suggestions"), href: "/suggestions" },
];


  const { openModal } = useModalStore();

  const MobileNavItems = [
    { label: t('navbar.tree_view'), href: '/base' },
    { label: t('navbar.members'), href: '/members' },
    { label: t('navbar.notifications'), href: '/notifications' },
    { label: t('navbar.suggestions'), href: '/suggestions' },
    { label: t('navbar.export'), action: () => openModal('pdfExportModal') },
    { label: t('navbar.settings'), href: '/settings' },
    { label: t('navbar.language'), href: '/language' },
  ];

  return (
    <nav className="NavBar" style={{ background: "var(--color-white)", boxShadow: "0 2px 4px rgba(0,0,0,.1)" }}>

      {/* Logo Section */}
      <Row fitContent justifyContent="start" padding="0px" margin="0px">
        <ImageCard image="/Images/Logo.png" size={45} rounded margin="0px" />
        <Text variant="heading2" style={{ color: "var(--color-primary1)" }}>Taf'Yaa</Text>
      </Row>

      {/* Desktop Nav */}
      <div className="desktop-nav">
        <Row width="750px" fitContent={true} gap="1rem" justifyContent="end" padding="0px" margin="0px">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.href} className="navItem">
              {item.label}
            </NavLink>
          ))}

      {/* Language Selector */}
          <Card
            fitContent
            size={25}
            padding="3px"
            margin="5px"
            backgroundColor="var(--color-gray)"
            style={{ cursor: "pointer", position: "relative" }}
            onClick={() => setLangMenuOpen((prev) => !prev)}
         >
            <Row fitContent={true} gap="0.25rem" padding="0px" margin="0px">
            <EarthIcon size={20} color="var(--color-primary-text)" />
            <ChevronDown color="var(--color-primary-text)" />
            </Row>
         </Card>

      {/* Language Menu Portal */}
        {langMenuOpen &&
         ReactDOM.createPortal(
        <LanguageMenu isOpen={langMenuOpen} onClose={() => setLangMenuOpen(false)} />,
        document.body
        )
      }

          {/* Settings */}
          <Card
            fitContent
            size={20}
            onClick={toggleSubmenu}
            padding="6px"
            margin="2px"
            backgroundColor="var(--color-light-blue)"
            style={{ cursor: 'pointer', borderRadius: "8px" }}
          >
            <Settings size={20} color="var(--color-primary-text)" />
          </Card>

          {/* Notifications */}
          <Card
            fitContent
            size={20}
            padding="6px"
            margin="2px"
            backgroundColor="var(--color-light-blue)"
            style={{ cursor: 'pointer', borderRadius: "8px" }}
            onClick={() => window.location.href = "/notifications"}
          >
            <Bell size={20} color="var(--color-primary-text)" />
          </Card>

          {/* Export */}
          <Card
            fitContent
            size={20}
            onClick={() => openModal('pdfExportModal')}
            padding="6px"
            margin="2px"
            backgroundColor="var(--color-light-blue)"
            style={{ cursor: 'pointer', borderRadius: "8px" }}
          >
            <ArrowDownToLine size={20} color="var(--color-primary-text)" />
          </Card>



          {/* Profile */}
          <Card
            fitContent
            rounded
            size={35}
            onClick={toggleSubmenu}
            padding="6px"
            margin="5px"
            backgroundColor="var(--color-transparent)"
            style={{ cursor: 'pointer' }}
          >
            <CircleUser size={30} color="var(--color-primary1)" />
          </Card>
        </Row>
      </div>

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
            {MobileNavItems.map((item) =>
              item.href ? (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className="mobile-nav-item"
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </NavLink>
              ) : (
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
              )
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Submenu Portal */}
      {submenuOpen && ReactDOM.createPortal(
        <div className="submenu">
          <Card margin="0.25rem" height="30px" padding="0.5rem 1rem" className="submenuItem">
            <Text as="a" href="/#">Profile</Text>
          </Card>
          <Card margin="0.25rem" height="30px" padding="0.5rem 1rem" className="submenuItem">
            <Text as="a" href="/#">Settings</Text>
          </Card>
          <Card margin="0.25rem" height="30px" padding="0.5rem 1rem" className="submenuItem">
            <Text as="a" href="/#">Log Out</Text>
          </Card>
        </div>,
        document.body
      )}

    </nav>
  );
}
