import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import Column from "../layout/containers/Column";
import Card from "../layout/containers/Card";
import Row from "../layout/containers/Row";
import Text from "../components/Text";
import Button from "../components/Button";
import NotificationOverviewCard from "../components/NotificationOverviewCard";
import "../styles/NotificationCenter.css";

const DUMMY_NOTIFICATIONS = [
  {
    id: "n1",
    type: "suggestions",
    title: "AI Suggestions",
    description: "New potential connections found",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    to: (treeId) => `/family-tree/${treeId}/notificationcenter/suggestions`,
  },
  {
    id: "n2",
    type: "merge",
    title: "Merge Requests",
    description: "You have new tree merge requestsYou have new tree merge requestsYou have new tree merge requestsYou have new tree merge requestsYou have new tree merge requestsYou have new tree merge requests",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    to: (treeId) => `/family-tree/${treeId}/notificationcenter/merge`,
  },
  {
    id: "n3",
    type: "requests",
    title: "Pending Requests",
    description: "Requests awaiting your approval",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    to: (treeId) => `/family-tree/${treeId}/notificationcenter/requests`,
  },
  {
    id: "n4",
    type: "activity",
    title: "Family Activity",
    description: "Recent updates and changes",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    to: (treeId) => `/family-tree/${treeId}/notificationcenter/activity`,
  },
  {
    id: "n5",
    type: "suggestions",
    title: "AI Suggestions",
    description: "Name matches based on records",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    to: (treeId) => `/family-tree/${treeId}/notificationcenter/suggestions`,
  },
  {
    id: "n6",
    type: "requests",
    title: "Pending Requests",
    description: "3 requests to review",
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    to: (treeId) => `/family-tree/${treeId}/notificationcenter/requests`,
  },
];

const NotificationOverviewPage = () => {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Column gap="1rem" padding="0" className="overview-section">
      <Row justifyContent="space-between" alignItems="center" padding="0" margin="0">
        <Text as="h3" variant="h3">{t('navbar.recent_activity')}</Text>
        <Button variant="secondary" size="sm" onClick={() => navigate(`/family-tree/${treeId}/notificationcenter/activity`)}>
          {t('navbar.view_all')}
        </Button>
      </Row>

      <Column justifyContent="flex-start" gap="1rem" margin="0px" padding="0px 20px 20px 10px">
        {DUMMY_NOTIFICATIONS.map((n) => (
          <NotificationOverviewCard
            key={n.id}
            type={n.type}
            title={n.title}
            description={n.description}
            createdAt={n.createdAt}
            onClick={() => navigate(n.to(treeId))}
            action={<Card backgroundColor="var(--color-primary2)"><ChevronRight size={16} /></Card>}
          />
        ))}
      </Column>
    </Column>
  );
};

export default NotificationOverviewPage; 