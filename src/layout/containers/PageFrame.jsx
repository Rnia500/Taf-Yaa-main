import React from 'react';
import '../../styles/PageFrame.css';
import ProfileSidebar from '../../components/sidebar/ProfileSidebar';
import InviteDetailsSidebar from '../../components/sidebar/InviteDetailsSidebar';

export default function PageFrame({
  topbar,
  sidebar,
  sidebarContentType = 'peopleprofile', // Default to peopleprofile
  sidebarProps = {},
  sidebarOpen = false,
  onSidebarClose,
  footer,
  footerInsideMain = false,
  children,
}) {
  // Determine if mobile (<=768px)
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when sidebar overlays (mobile)
  React.useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => (document.body.style.overflow = '');
  }, [isMobile, sidebarOpen]);

  // Render sidebar content based on contentType
  const renderSidebarContent = () => {
    if (sidebarContentType === 'peopleprofile') {
      return <ProfileSidebar onClose={onSidebarClose} {...sidebarProps} />;
    } else if (sidebarContentType === 'invite') {
      return <InviteDetailsSidebar key={sidebarProps.invite?.id} onClose={onSidebarClose} {...sidebarProps} />;
    }
    // Default fallback
    return <ProfileSidebar onClose={onSidebarClose} {...sidebarProps} />;
  };

  return (
    <div className="pf-root">
      {/* Topbar */}
      <div className="pf-topbar">{topbar}</div>

      {/* Body */}
      <div className={"pf-body" + (sidebarOpen && !isMobile ? ' pf-body-sidebar-open' : '')}>
        {/* Sidebar */}
        {sidebar && (
          <aside
            className={[
              'pf-sidebar',
              sidebarOpen ? 'pf-sidebar-open' : '',
              isMobile ? 'pf-sidebar-mobile' : '',
            ].join(' ')}
            style={{ width: !isMobile && sidebarOpen ? 350 : undefined }}
          >
            {renderSidebarContent()}
          </aside>
        )}
        {/* Overlay for mobile */}
        {sidebarOpen && isMobile && <div className="pf-overlay" onClick={onSidebarClose} />}

        {/* Main content + footer wrapper */}
        <div className="pf-main-footer-wrapper">
          <main className="pf-main">{children}
            {footerInsideMain && footer && (
              <footer className="pf-footer">{footer}</footer>
            )}
          </main>
          {/* Sticky footer outside main, only under main area */}
          {!footerInsideMain && footer && (
            <footer className="pf-footer pf-footer-outside">{footer}</footer>
          )}
        </div>
      </div>
    </div>
  );
}
