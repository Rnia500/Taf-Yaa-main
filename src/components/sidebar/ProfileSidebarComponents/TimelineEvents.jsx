import React, { useState } from 'react';
import Divider from '../../Divider';
import Button from '../../Button';
import Card from '../../../layout/containers/Card';
import '../../../styles/Timeline.css';
import ClampText from '../../ClampText';
import Text from '../../Text';

function TimelineEvent({ title, date, isLast, description }) {
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
                <Text paragraph variant='caption1'>Under a canopy of stars, Maya and Idris vowed to walk life’s winding path together. 🎶 Their wedding echoed with laughter, music, and the scent of jasmine drifting through the air. ❤️ Years later, their love still dances—sometimes slow, sometimes wild, but always in step.</Text>
              </Card>
            )}
          </>
        ) : (
          <Button size='sm' variant='secondary'>Add a description</Button>
        )}
      </div>
    </div>
  );
}

/**
 * Represents the entire timeline block with a list of events.
 */
export default function TimelineEvents({ events = [], onAddEvent }) {
  return (
    <Card backgroundColor="transparent" alignItems="flex-start">
      <div className="timeline-block">
        <div className="timeline-header">Timeline Events</div>
        <div className="timeline-list">
          {events.map((event, index) => (
            <TimelineEvent
              key={event.id} 
              title={event.title}
              date={event.date}
              description={event.description}
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