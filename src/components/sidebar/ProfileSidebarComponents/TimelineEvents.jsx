import React from 'react';
import Divider from '../../Divider';
import Button from '../../Button';
import Card from '../../../layout/containers/Card'
import '../../../styles/Timeline.css';

function TimelineEvent({ title, date, isLast }) {
  return (
    <div className="timeline-event">
      <div className={`timeline-marker${isLast ? ' last' : ''}`} />
      <div className="timeline-content">
        <Divider thickness="1px" />
        <div className="timeline-title">{title}</div>
        <div className="timeline-date">{date}</div>
      </div>
    </div>
  );
}

export default function TimelineEvents({ events = [], onAddEvent }) {
  return (
    <Card backgroundColor="transparent" alignItems="flex-start">
      <div className="timeline-block">
        <div className="timeline-header">Timeline Events</div>
        <div className="timeline-list">
          {events.map((event, index) => (
            <TimelineEvent
              key={index}
              title={event.title}
              date={event.date}
              isLast={index === events.length - 1}
            />
          ))}
        </div>
        <Button onClick={onAddEvent} variant="primary" fullWidth>
          + Add Event
        </Button>
      </div>
    </Card>
  );
}
