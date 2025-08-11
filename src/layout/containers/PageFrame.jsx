import React from 'react';
import '../../styles/PageFrame.css';

export default function PageFrame({
  topbar,
  sidebar,
  sidebarOpen = false,
  onSidebarClose,
  footer,
  footerInsideMain = false,
  children,
}) {
  // Determine if mobile (<=350px)
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 350);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 350);
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
            {isMobile && (
              <button className="pf-close" onClick={onSidebarClose} aria-label="Close sidebar">×</button>
            )}
            {sidebar}
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
