import React, { useState } from "react";
import { useNavigate, useLocation, Outlet, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Lightbulb,
  GitMerge,
  Clock,
  History,
  TreePine,
  ChevronRight,
  Settings,
  User,
  Users,
  X
} from "lucide-react";
import "../styles/NotificationCenter.css";
import NavigationSideBar from "../components/NavigationSideBar/NavigationSideBar";
import Row from "../layout/containers/Row";
import Column from "../layout/containers/Column";
import Card from "../layout/containers/Card";
import Text from "../components/Text";
import Button from "../components/Button";

const NotificationCenter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { treeId } = useParams();
  const [activeSection, setActiveSection] = useState("overview");
  const { t } = useTranslation();

  // Navigation items configuration for the notification center sidebar
  const navigationItems = [
    {
      id: 'overview',
      label: t('navbar.overview'),
      icon: <Bell size={18} />,
      count: 5,
      path: `/family-tree/${treeId}/notificationcenter`,
      active: activeSection === 'overview'
    },
    {
      id: 'suggestions',
      label: t('navbar.ai_suggestions'),
      icon: <Lightbulb size={18} />,
      count: 3,
      path: `/family-tree/${treeId}/notificationcenter/suggestions`,
      active: activeSection === 'suggestions'
    },
    {
      id: 'merge',
      label: t('navbar.merge_requests'),
      icon: <GitMerge size={18} />,
      count: 2,
      path: `/family-tree/${treeId}/notificationcenter/merge`,
      active: activeSection === 'merge'
    },
    {
      id: 'requests',
      label: t('navbar.pending_requests'),
      icon: <Clock size={18} />,
      count: 8,
      path: `/family-tree/${treeId}/notificationcenter/requests`,
      active: activeSection === 'requests'
    },
    {
      id: 'activity',
      label: t('navbar.family_activity'),
      icon: <History size={18} />,
      count: 12,
      path: `/family-tree/${treeId}/notificationcenter/activity`,
      active: activeSection === 'activity'
    },
  ];

  // Quick actions configuration
  const quickActions = [
    {
      id: 'view-profile',
      label: t('navbar.view_profile'),
      icon: <User size={16} />,
      onClick: () => navigate(`/family-tree/${treeId}`)
    },
    {
      id: 'settings',
      label: t('navbar.settings'),
      icon: <Settings size={16} />,
      onClick: () => navigate('/settings')
    }
  ];

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    const section = navigationItems.find(item => item.id === sectionId);
    if (section && section.path) {
      if (sectionId === 'overview') {
        navigate(`/family-tree/${treeId}/notificationcenter`);
      } else {
        navigate(section.path);
      }
    }
  };

  // Update active section based on current location
  React.useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === `/family-tree/${treeId}/notificationcenter/suggestions`) {
      setActiveSection('suggestions');
    } else if (currentPath === `/family-tree/${treeId}/notificationcenter/merge`) {
      setActiveSection('merge');
    } else if (currentPath === `/family-tree/${treeId}/notificationcenter/requests`) {
      setActiveSection('requests');
    } else if (currentPath === `/family-tree/${treeId}/notificationcenter/activity`) {
      setActiveSection('activity');
    } else if (currentPath === `/family-tree/${treeId}/notificationcenter` || currentPath === `/family-tree/${treeId}/notificationcenter/`) {
      setActiveSection('overview');
    }
  }, [location.pathname, treeId]);

  return (
    <div className="notification-center">
      
      <div className="notification-center-body">
        <div className="sidebar-container">
          <NavigationSideBar
            navItems={navigationItems}
            title={t('navbar.activity_hub')}
            quickActions={quickActions}
            showQuickActions={true}
          />
        </div>

        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
