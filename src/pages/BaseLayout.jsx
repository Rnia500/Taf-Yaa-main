import React, { useState } from 'react';
import PageFrame from '../layout/containers/PageFrame';
import ProfileSidebar from '../components/sidebar/ProfileSidebar';
import Card from '../layout/containers/Card';
import ComponentDemo from './ComponentDemo';
import DefaultNavbar from '../components/navbar/DefaultNavbar';
import AdminNavbar from '../components/navbar/AdminNavbar';
import ModeratorNavbar from '../components/navbar/ModeratorNavbar';
import EditorNavbar from '../components/navbar/EditorNavbar';
import ViewerNavbar from '../components/navbar/EditorNavbar';

export default function BaseLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PageFrame
      topbar={<AdminNavbar />}
      sidebar={<ProfileSidebar onClose={() => setSidebarOpen(false)} />}
      sidebarOpen={sidebarOpen}
      onSidebarClose={() => setSidebarOpen(false)}
      footer={
        <div style={{ textAlign: 'center', width: '100%' }}>
          © {new Date().getFullYear()} Taf'Yaa · All rights reserved
        </div>
      }
      footerInsideMain={true}
    >
      <>
        <Card>
          <h1>Welcome to Taf'Yaa</h1>
          <p>Default navbar is now active for testing</p>
          <button onClick={() => setSidebarOpen(true)} style={{ padding: '8px 16px', fontSize: 16 }}>
            Open Profile Sidebar
          </button>
        </Card>

        <ComponentDemo setSidebarOpen={setSidebarOpen} />
      </>
    </PageFrame>
  );
}
