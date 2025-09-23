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

  const renderOverview = () => (
    <div className="overview-section">
      <div className="overview-header">
        <h3>{t('navbar.recent_activity')}</h3>
        <button className="view-all-btn">{t('navbar.view_all')}</button>
      </div>

      <div className="activity-list">
        <div className="activity-item">
          <div className="activity-icon suggestions">
            <Lightbulb size={16} />
          </div>
          <div className="activity-content">
            <p><strong>{t('navbar.ai_suggestions')}</strong></p>
            <p>{t('navbar.new_potential_connections')}</p>
            <span className="activity-time">{t('navbar.hours_ago')}</span>
          </div>
          <button className="activity-action" onClick={() => navigate(`/family-tree/${treeId}/notificationcenter/suggestions`)}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="activity-item">
          <div className="activity-icon merge">
            <GitMerge size={16} />
          </div>
          <div className="activity-content">
            <p><strong>{t('navbar.merge_requests')}</strong></p>
            <p>{t('navbar.merge_request_from')}</p>
            <span className="activity-time">5 hours ago</span>
          </div>
          <button className="activity-action" onClick={() => navigate(`/family-tree/${treeId}/notificationcenter/merge`)}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="activity-item">
          <div className="activity-icon requests">
            <Clock size={16} />
          </div>
          <div className="activity-content">
            <p><strong>{t('navbar.pending_requests')}</strong></p>
            <p>{t('navbar.requests_awaiting_approval')}</p>
            <span className="activity-time">{t('navbar.day_ago')}</span>
          </div>
          <button className="activity-action" onClick={() => navigate(`/family-tree/${treeId}/notificationcenter/requests`)}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="activity-item">
          <div className="activity-icon activity">
            <Users size={16} />
          </div>
          <div className="activity-content">
            <p><strong>{t('navbar.family_activity')}</strong></p>
            <p>{t('navbar.recent_updates_changes')}</p>
            <span className="activity-time">{t('navbar.days_ago')}</span>
          </div>
          <button className="activity-action" onClick={() => navigate(`/family-tree/${treeId}/notificationcenter/activity`)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'merge':
        return (
          <div className="section-content">
            <h3>{t('navbar.merge_requests')}</h3>
            <p>{t('navbar.manage_merge_requests')}</p>
            <button className="primary-btn" onClick={() => navigate(`/family-tree/${treeId}/notificationcenter/merge`)}>
              {t('navbar.view_merge_requests')}
            </button>
          </div>
        );
      case 'requests':
        return (
          <div className="section-content">
            <h3>{t('navbar.pending_requests')}</h3>
            <p>{t('navbar.review_approve_requests')}</p>
            <button className="primary-btn" onClick={() => navigate(`/family-tree/${treeId}/notificationcenter/requests`)}>
              {t('navbar.view_all_requests')}
            </button>
          </div>
        );
      case 'activity':
        return (
          <div className="section-content">
            <h3>{t('navbar.family_activity')}</h3>
            <p>{t('navbar.view_recent_changes')}</p>
            <button className="primary-btn" onClick={() => navigate(`/family-tree/${treeId}/notificationcenter/activity`)}>
              {t('navbar.view_activity_history')}
            </button>
          </div>
        );
      default:
        return renderOverview();
    }
  };

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
          {activeSection === 'overview' ? renderOverview() : <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
