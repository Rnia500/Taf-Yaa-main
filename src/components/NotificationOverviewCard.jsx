import React, { useMemo } from "react";
import Card from "../layout/containers/Card";
import Row from "../layout/containers/Row";
import Column from "../layout/containers/Column";
import Text from "./Text";
import Button from "./Button";
import { Lightbulb, GitMerge, Clock as ClockIcon, Users } from "lucide-react";
import { formatArrivalTime } from "../utils/featuresUtils/formatArrivalTime"

const typeToIcon = {
  suggestions: <Lightbulb size={16} />,
  merge: <GitMerge size={16} />,
  requests: <ClockIcon size={16} />,
  activity: <Users size={16} />,
};


const NotificationOverviewCard = ({
  type = "activity",
  title,
  description,
  createdAt,
  onClick,
  action,
}) => {
  const icon = typeToIcon[type] || typeToIcon.activity;
  const timeLabel = useMemo(() => formatArrivalTime({ createdAt }), [createdAt]);

    const truncatedDescription = useMemo(() => {
    if (!description || typeof description !== 'string') return '';
    const limit = 80; // non-space characters
    let count = 0;
    let endIndex = 0;
    for (let i = 0; i < description.length; i++) {
      const ch = description[i];
      if (ch.trim() !== '') {
        count++;
      }
      endIndex = i + 1;
      if (count >= limit) {
        break;
      }
    }
    if (count <= limit && endIndex === description.length) {
      return description;
    }
    return description.slice(0, endIndex).trimEnd() + '...';
  }, [description]);

  return (
    <Card maxWidth={900} padding="0.5rem 1rem 0.5rem 0.5rem" backgroundColor="var(--color-background)" onClick={onClick}>
      <Row gap="1rem" padding="0" fitContent justifyContent="space-between">

        <Row width="100%" padding="0px"  margin="0px" fitContent>
          <Card backgroundColor="var(--color-ground)">
            {icon}
          </Card>
          <Column padding="0" gap="0rem">
            <Row padding="0px" margin="0px" fitContent justifyContent="flex-start">
              <Text as="p" variant="body1" bold>{title}</Text>
              <Text as="p" variant="caption1">{timeLabel}</Text>
            </Row>            
              <Text ellipsis variant="body2" >{truncatedDescription}</Text>
          </Column>
        </Row>
        {action}
      </Row>
    </Card>
  );
};

export default NotificationOverviewCard; 