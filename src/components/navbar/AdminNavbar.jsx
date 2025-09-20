import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import Row from '../../layout/containers/Row';
import ImageCard from '../../layout/containers/ImageCard';
import Text from '../Text';
import { CircleUser, Menu, X, EarthIcon, Settings, Bell, Trash2, ArrowDownToLine } from 'lucide-react';
import Card from '../../layout/containers/Card';
import '../../styles/Navbar.css';
import PDFExport from '../PdfExport';
import useModalStore from '../../store/useModalStore';
import { NavLink } from "react-router-dom";



export default function AdminNavbar() {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { treeId } = useParams();

  const toggleSubmenu = () => setSubmenuOpen(prev => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navItems = [
    { label: 'Tree View', href: '#content' },
    { label: 'Members', href: '#content' },
    { label: 'Notification', href: '#content' },
    { label: 'Suggestions', href: '#content' },
    { label: 'Export', href: '/export' },
  ];

  const MobileNavItems = [
    { label: 'Tree View', href: treeId ? `/family-tree/${treeId}` : '#content', isLink: true },
    { label: 'Members', href: '#content', isLink: false },
    { label: 'Notification', href: '#content', isLink: false },
    { label: 'Suggestions', href: '#content', isLink: false },
    { label: 'Export', action: () => openModal('pdfExportModal'), isLink: false },
    { label: 'Deleted Persons', href: treeId ? `/family-tree/${treeId}/deleted-persons` : '/deleted-persons', isLink: true },
    { label: 'Settings', href: '#content', isLink: false },
    { label: 'Language', href: '#content', isLink: false },

  ];

  return (
    <nav className='NavBar'>
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
                item.isLink ? (
                  <Link key={item.label} to={item.href}>
                    <Text className='navItem' variant='body1' bold>
                      {item.label}
                    </Text>
                  </Link>
                ) : (
                  <Text key={item.label} className='navItem' as='a' variant='body1' bold href={item.href}>
                    {item.label}
                  </Text>
                )
              ))}
            </div>

            <div className="action-buttons">
              <Link to={treeId ? `/family-tree/${treeId}/deleted-persons` : '/deleted-persons'}>
                <div className="action-btn">
                  <Trash2 size={20} color="var(--color-primary-text)" />
                </div>
              </Link>

              <div className="action-btn" onClick={() => { alert("hello boy") }}>
                <EarthIcon size={20} color="var(--color-primary-text)" />
              </div>

              <div className="action-btn" onClick={() => openModal('pdfExportModal')}>
                <ArrowDownToLine size={20} color="var(--color-primary-text)"  />
              </div>

              <div className="action-btn" onClick={toggleSubmenu}>
                <Settings size={20} color="var(--color-primary-text)" />
              </div>

              <div className="action-btn" onClick={toggleSubmenu}>
                <Bell size={20} color="var(--color-primary-text)" />
              </div>

              <div className="action-btn" onClick={toggleSubmenu}>
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
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && ReactDOM.createPortal(
        <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            {MobileNavItems.map((item) => (
              item.isLink ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="mobile-nav-item"
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="mobile-nav-item"
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </a>
              )
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Submenu Portal */}
      {submenuOpen && ReactDOM.createPortal(
        <div className="submenu">
          <Card margin='0.25rem' height='30px' padding='0.5rem 1rem' className='submenuItem'>
            <Text as='a' href="/#">Profile</Text>
          </Card>
          <Card margin='0.25rem' height='30px' padding='0.5rem 1rem' className='submenuItem'>
            <Text as='a' href="/#">Settings</Text>
          </Card>
          <Card margin='0.25rem' height='30px' padding='0.5rem 1rem' className='submenuItem'>
            <Text as='a' href="/#">Log Out</Text>
          </Card>
        </div>,
        document.body
      )}
    </nav>
  );
}
