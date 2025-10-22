// src/pages/BaseLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PageFrame from '../layout/containers/PageFrame';
import ProfileSidebar from '../components/sidebar/ProfileSidebar';
import AdminNavbar from '../components/navbar/AdminNavbar';
import MyTreeNavBar from '../components/navbar/MyTreeNavBar';
import useSidebarStore from '../store/useSidebarStore';
import InviteDetailsSidebar from '../components/sidebar/InviteDetailsSidebar';

import Toast from '../components/toasts/Toast';



export default function BaseLayout() {
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);
  const location = useLocation();

  
  const isMyStoriesPage = location.pathname === '/my-stories';
  const navbar = isMyStoriesPage ? <MyTreeNavBar /> : <AdminNavbar />;

  
  const getSidebarContentType = () => {
    
    if (location.pathname.includes('/invites')) {
      return 'invite';
    }
    return 'peopleprofile'; // Default
  };

  
  const activeInvite = useSidebarStore((state) => state.activeInvite);

  const getSidebarProps = () => {
    return { invite: activeInvite };
  };

  return (
    <PageFrame
      topbar={navbar}

      sidebar={true}
      sidebarContentType={getSidebarContentType()} 
      sidebarProps={getSidebarProps()}
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
