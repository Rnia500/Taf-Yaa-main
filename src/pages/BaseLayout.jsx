import React, { useState } from 'react';
import PageFrame from '../layout/containers/PageFrame';
import ProfileSidebar from '../components/sidebar/ProfileSidebar';
import Card from '../layout/containers/Card';
import ComponentDemo from './ComponentDemo';
import AdminNavbar from '../components/navbar/AdminNavbar';
import PDFExport from '../components/PdfExport';
import useModalStore from '../store/useModalStore';
import { useTranslation } from 'react-i18next';

export default function BaseLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { modals, closeModal } = useModalStore();
  const { t } = useTranslation();

  return (
    <PageFrame
      topbar={<AdminNavbar />}
      sidebar={<ProfileSidebar onClose={() => setSidebarOpen(false)} />}
      sidebarOpen={sidebarOpen}
      onSidebarClose={() => setSidebarOpen(false)}
      footer={
        <div style={{ textAlign: 'center', width: '100%' }}>
          © {new Date().getFullYear()} Taf'Yaa · {t("baselayout.footer")}
        </div>
      }
      footerInsideMain={true}
    >
      <>
        <PDFExport
          isOpen={modals.pdfExportModal}
          onClose={() => closeModal('pdfExportModal')}
        />

        <Card>
          <h1>{t("baselayout.welcome_title")}</h1>
          <p>{t("baselayout.navbar_status")}</p>
          <button 
            onClick={() => setSidebarOpen(true)} 
            style={{ padding: '8px 16px', fontSize: 16 }}
          >
            {t("baselayout.open_sidebar")}
          </button>
        </Card>

        <ComponentDemo />
      </>
    </PageFrame>
  );
}
