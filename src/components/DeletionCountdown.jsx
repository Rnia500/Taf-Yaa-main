import React, { useState, useEffect } from 'react';
import Text from './Text';

const DeletionCountdown = ({ 
  timeRemaining, 
  isExpired = false, 
  variant = 'default',
  showDetails = false 
}) => {
  const [currentTime, setCurrentTime] = useState(timeRemaining);

  useEffect(() => {
    if (isExpired || currentTime <= 0) {
      setCurrentTime(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = Math.max(0, prev - 1000);
        if (newTime === 0) {
          clearInterval(interval);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired, timeRemaining]);

  const formatTime = (ms) => {
    if (ms <= 0) return 'Expired';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (days > 0) {
      return showDetails 
        ? `${days}d ${hours}h ${minutes}m`
        : `${days} day${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return showDetails
        ? `${hours}h ${minutes}m ${seconds}s`
        : `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return showDetails
        ? `${minutes}m ${seconds}s`
        : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
  };

  const getColor = () => {
    if (isExpired || currentTime <= 0) return 'danger';
    if (currentTime < 24 * 60 * 60 * 1000) return 'warning'; // Less than 1 day
    if (currentTime < 7 * 24 * 60 * 60 * 1000) return 'warning'; // Less than 1 week
    return 'success';
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'compact':
        return {
          fontSize: '0.75rem',
          fontWeight: '500',
          padding: '2px 6px',
          borderRadius: '4px',
          backgroundColor: `var(--color-${getColor()}-light)`,
          color: `var(--color-${getColor()})`,
          border: `1px solid var(--color-${getColor()})`,
        };
      case 'badge':
        return {
          fontSize: '0.8rem',
          fontWeight: '600',
          padding: '4px 8px',
          borderRadius: '12px',
          backgroundColor: `var(--color-${getColor()}-light)`,
          color: `var(--color-${getColor()})`,
          border: `1px solid var(--color-${getColor()})`,
          display: 'inline-block',
        };
      default:
        return {
          fontSize: '0.9rem',
          fontWeight: '500',
          color: `var(--color-${getColor()})`,
        };
    }
  };

  return (
    <Text 
      style={getVariantStyle()}
      variant="caption"
      color={getColor()}
    >
      {formatTime(currentTime)}
    </Text>
  );
};

export default DeletionCountdown;
