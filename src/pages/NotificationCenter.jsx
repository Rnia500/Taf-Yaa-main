import React, { useState } from "react";
import { useNavigate, useLocation, Outlet, useParams } from "react-router-dom";
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

  // Navigation items configuration for the notification center sidebar
  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Bell size={18} />,
      count: 5,
      path: `/family-tree/${treeId}/notifications`,
      active: activeSection === 'overview'
    },
    {
      id: 'suggestions',
      label: 'AI Suggestions',
      icon: <Lightbulb size={18} />,
      count: 3,
      path: `/family-tree/${treeId}/notifications/suggestions`,
      active: activeSection === 'suggestions'
    },
    {
      id: 'merge',
      label: 'Merge Requests',
      icon: <GitMerge size={18} />,
      count: 2,
      path: `/family-tree/${treeId}/notifications/merge`,
      active: activeSection === 'merge'
    },
    {
      id: 'requests',
      label: 'Pending Requests',
      icon: <Clock size={18} />,
      count: 8,
      path: `/family-tree/${treeId}/notifications/requests`,
      active: activeSection === 'requests'
    },
    {
      id: 'activity',
      label: 'Family Activity',
      icon: <History size={18} />,
      count: 12,
      path: `/family-tree/${treeId}/notifications/activity`,
      active: activeSection === 'activity'
    },
    {
      id: 'family-tree',
      label: 'Family Tree',
      icon: <TreePine size={18} />,
      count: null,
      path: `/family-tree/${treeId}`,
      active: activeSection === 'family-tree'
    }
  ];

  // Quick actions configuration
  const quickActions = [
    {
      id: 'view-profile',
      label: 'View Profile',
      icon: <User size={16} />,
      onClick: () => navigate(`/family-tree/${treeId}`)
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={16} />,
      onClick: () => navigate('/settings')
    }
  ];

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    const section = navigationItems.find(item => item.id === sectionId);
    if (section && section.path) {
      // Since we're already in the nested route structure, use relative navigation
      if (sectionId === 'overview') {
        navigate(`/family-tree/${treeId}/notifications`);
      } else {
        navigate(section.path);
      }
    }
  };

  // Update active section based on current location
  React.useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === `/family-tree/${treeId}/notifications/suggestions`) {
      setActiveSection('suggestions');
    } else if (currentPath === `/family-tree/${treeId}/notifications/merge`) {
      setActiveSection('merge');
    } else if (currentPath === `/family-tree/${treeId}/notifications/requests`) {
      setActiveSection('requests');
    } else if (currentPath === `/family-tree/${treeId}/notifications/activity`) {
      setActiveSection('activity');
    } else if (currentPath === `/family-tree/${treeId}/notifications` || currentPath === `/family-tree/${treeId}/notifications/`) {
      setActiveSection('overview');
    }
  }, [location.pathname, treeId]);

  const renderOverview = () => (
    <div className="overview-section">
      <div className="overview-header">
        <h3>Recent Activity</h3>
        <button className="view-all-btn">View All</button>
      </div>

      <div className="activity-list">
        <div className="activity-item">
          <div className="activity-icon suggestions">
            <Lightbulb size={16} />
          </div>
          <div className="activity-content">
            <p><strong>AI Suggestions Available</strong></p>
            <p>3 new potential family connections found</p>
            <span className="activity-time">2 hours ago</span>
          </div>
          <button className="activity-action" onClick={() => navigate(`/family-tree/${treeId}/notifications/suggestions`)}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="activity-item">
          <div className="activity-icon merge">
            <GitMerge size={16} />
          </div>
          <div className="activity-content">
            <p><strong>Merge Request</strong></p>
            <p>Kwame Asante wants to merge family trees</p>
            <span className="activity-time">5 hours ago</span>
          </div>
          <button className="activity-action" onClick={() => navigate(`/family-tree/${treeId}/notifications/merge`)}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="activity-item">
          <div className="activity-icon requests">
            <Clock size={16} />
          </div>
          <div className="activity-content">
            <p><strong>Pending Requests</strong></p>
            <p>8 requests awaiting your approval</p>
            <span className="activity-time">1 day ago</span>
          </div>
          <button className="activity-action" onClick={() => navigate(`/family-tree/${treeId}/notifications/requests`)}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="activity-item">
          <div className="activity-icon activity">
            <Users size={16} />
          </div>
          <div className="activity-content">
            <p><strong>Family Activity</strong></p>
            <p>Recent updates and changes in your family tree</p>
            <span className="activity-time">2 days ago</span>
          </div>
          <button className="activity-action" onClick={() => navigate(`/family-tree/${treeId}/notifications/activity`)}>
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
            <h3>Merge Requests</h3>
            <p>Manage requests to merge your family tree with others.</p>
            <button className="primary-btn" onClick={() => navigate(`/family-tree/${treeId}/notifications/merge`)}>
              View Merge Requests
            </button>
          </div>
        );
      case 'requests':
        return (
          <div className="section-content">
            <h3>Pending Requests</h3>
            <p>Review and approve pending requests from family members.</p>
            <button className="primary-btn" onClick={() => navigate(`/family-tree/${treeId}/notifications/requests`)}>
              View All Requests
            </button>
          </div>
        );
      case 'activity':
        return (
          <div className="section-content">
            <h3>Family Activity</h3>
            <p>View recent changes and updates to your family tree.</p>
            <button className="primary-btn" onClick={() => navigate(`/family-tree/${treeId}/notifications/activity`)}>
              View Activity History
            </button>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="notification-center">
      <div className="notification-center-header">
        <div className="header-content">
          <Bell size={24} />
          <div>
            <h1>Notification Center</h1>
            <p>Manage all your family tree activities and notifications</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="mark-read-btn">Mark All Read</button>
          <button className="close-btn" onClick={() => navigate(-1)}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="notification-center-body">
        <div className="sidebar-container">
          <NavigationSideBar
            navItems={navigationItems}
            title="Activity Hub"
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
