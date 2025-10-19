// src/pages/BaseLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PageFrame from '../layout/containers/PageFrame';
import ProfileSidebar from '../components/sidebar/ProfileSidebar';
import AdminNavbar from '../components/navbar/AdminNavbar';
import MyTreeNavBar from '../components/navbar/MyTreeNavBar';
import useSidebarStore from '../store/useSidebarStore';

import Toast from '../components/toasts/Toast';



export default function BaseLayout() {
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);
  const location = useLocation();

  // Use MyTreeNavBar for my-stories page, AdminNavbar for others
  const isMyStoriesPage = location.pathname === '/my-stories';
  const navbar = isMyStoriesPage ? <MyTreeNavBar /> : <AdminNavbar />;

  return (
    <PageFrame
      topbar={navbar}

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
