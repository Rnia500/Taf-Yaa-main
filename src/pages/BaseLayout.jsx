// src/pages/BaseLayout.jsx
import React from 'react';
import PageFrame from '../layout/containers/PageFrame';
import ProfileSidebar from '../components/sidebar/ProfileSidebar';
import Card from '../layout/containers/Card';
import AdminNavbar from '../components/navbar/AdminNavbar';
import FamilyTreePage from './FamilyTreePage';
import useSidebarStore from '../store/useSidebarStore';
import Text from '../components/Text';
import ComponentDemo from './ComponentDemo';

export default function BaseLayout() {
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);

  
  

  return (
    <PageFrame
      topbar={<AdminNavbar />}
     
      sidebar={<ProfileSidebar onClose={closeSidebar} />}
      
      sidebarOpen={isSidebarOpen}
     
      onSidebarClose={closeSidebar}
    >
      <>
        {/* <Card>
          <Text variant='heading1'>Welcome to Taf'Yaa</Text>
        </Card> */}

        <FamilyTreePage />
         {/* <ComponentDemo setSidebarOpen={() => {}} /> */}
      </>
    </PageFrame>
  );
}