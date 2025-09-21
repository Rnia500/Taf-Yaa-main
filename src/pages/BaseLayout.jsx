// src/pages/BaseLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PageFrame from '../layout/containers/PageFrame';
import ProfileSidebar from '../components/sidebar/ProfileSidebar';
import Card from '../layout/containers/Card';
import AdminNavbar from '../components/navbar/AdminNavbar';
import ModeratorNavbar from '../components/navbar/ModeratorNavbar';
import EditorNavbar from '../components/navbar/EditorNavbar';
import ViewerNavbar from '../components/navbar/EditorNavbar';
import PDFExport from '../components/PdfExport';
import useModalStore from '../store/useModalStore';
import useSidebarStore from '../store/useSidebarStore';
import { useTranslation } from 'react-i18next';
import Toast from '../components/toasts/Toast';
import FamilyTreePage from './FamilyTreePage';



export default function BaseLayout() {
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);
  const location = useLocation();
  const { t } = useTranslation();

  // Check if we're on a nested route (any child route of family-tree)
  const isNestedRoute = location.pathname.split('/').length > 3;

  return (
    <PageFrame
      topbar={<AdminNavbar />}
     
      sidebar={<ProfileSidebar onClose={closeSidebar} />}
      
      sidebarOpen={isSidebarOpen}
     
      onSidebarClose={closeSidebar}
    >
      <>
        <Toast />
        <Outlet />
      </>
    </PageFrame>
  );
}
