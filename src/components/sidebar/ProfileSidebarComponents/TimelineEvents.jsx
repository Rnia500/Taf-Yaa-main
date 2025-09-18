import React, { useState } from 'react';
import Divider from '../../Divider';
import Button from '../../Button';
import Card from '../../../layout/containers/Card';
import '../../../styles/Timeline.css';
import ClampText from '../../ClampText';
import Text from '../../Text';

function TimelineEvent({ title, date, isLast, description, onAddDescription }) {
  const [isDescriptionVisible, setDescriptionVisible] = useState(false);

  const toggleDescriptionVisibility = () => {
    setDescriptionVisible(!isDescriptionVisible);
  };

  return (
    <div className="timeline-event">
      <div className={`timeline-marker${isLast ? ' last' : ''}`} />
      <div className="timeline-content">
        <Divider thickness="1px" />
        <div className="timeline-title">{title}</div>
        <div className="timeline-date">{date}</div>


        {description ? (

          <>
            <Button size='sm' onClick={toggleDescriptionVisibility} variant='info'>
              {isDescriptionVisible ? 'Hide description' : 'View description'}
            </Button>
            {isDescriptionVisible && (
              <Card>
                {/* <ClampText lines={3}>{description}</ClampText> */}
                <Text paragraph variant='caption1'>{description}</Text>
              </Card>
            )}
          </>
        ) : (
          <Button size='sm' variant='secondary' onClick={onAddDescription}>Add a description</Button>
        )}
      </div>
    </div>
  );
}

/**
 * Represents the entire timeline block with a list of events.
 */
export default function TimelineEvents({ events = [], onAddEvent, onAddDescription }) {
  return (
    <Card backgroundColor="transparent" alignItems="flex-start">
      <div className="timeline-block">
        <Text variant='heading3'>Timeline Events</Text>
        <div className="timeline-list">
          {events.length === 0 && (
            <Text variant='body1' color='tertiary-text'>No Event available.</Text>
          )}
          {events.map((event, index) => (
            <TimelineEvent
              key={event.id}
              title={event.title}
              date={event.date}
              description={event.description}
              isLast={index === events.length - 1}
              onAddDescription={onAddDescription}
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
