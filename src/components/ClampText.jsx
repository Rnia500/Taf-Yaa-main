import React, { useState } from 'react';
import Text from './Text';
import Button from './Button';

function ClampText({ children, lines = 2 }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Text variant="body1" truncateLines={expanded ? undefined : lines}>
        {children}
      </Text>
      <Button variant="link" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Show less' : 'Show more'}
      </Button>
    </>
  );
}

export default ClampText;
