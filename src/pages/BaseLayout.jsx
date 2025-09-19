// src/pages/BaseLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PageFrame from '../layout/containers/PageFrame';
import ProfileSidebar from '../components/sidebar/ProfileSidebar';
import Card from '../layout/containers/Card';
import AdminNavbar from '../components/navbar/AdminNavbar';
import FamilyTreePage from './FamilyTreePage';
import useSidebarStore from '../store/useSidebarStore';
import Text from '../components/Text';
import ComponentDemo from './ComponentDemo';
import Toast from '../components/toasts/Toast';

export default function BaseLayout() {
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);
  const location = useLocation();

  // Check if we're on a deleted persons page
  const isDeletedPersonsPage = location.pathname.includes('/deleted-persons');

  return (
    <PageFrame
      topbar={<AdminNavbar />}
     
      sidebar={<ProfileSidebar onClose={closeSidebar} />}
      
      sidebarOpen={isSidebarOpen}
     
      onSidebarClose={closeSidebar}
    >
      <>
        <Toast />
        {isDeletedPersonsPage ? <Outlet /> : <FamilyTreePage />}
      </>
    </PageFrame>
  );
}
