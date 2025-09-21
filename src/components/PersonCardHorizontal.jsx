import React, { useState, useEffect } from "react";
import PersonCardHorizontalSVG from "../layout/containers/PersonCardHorizontalSVG";
import Card from "../layout/containers/Card";
import ImageCard from "../layout/containers/ImageCard";
import Text from "./Text";
import { Mars, Venus, Plus, Clock } from "lucide-react";
import Row from "../layout/containers/Row";
import { AdminBadge, ModeratorBadge, EditorBadge, ViewerBadge } from "./PersonBadge";
import Spacer from "./Spacer";
//variants are root, directline, spouce, dead

function PersonCardHorizontal({ variant = "default", style, name, sex, birthDate, deathDate, role = 'null', isDead = false, profileImage, isPlaceholder = false, isSoftDeleted = false, undoExpiresAt, onAdd, onClick }) {
  const [timeLeft, setTimeLeft] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Countdown timer for soft deleted persons
  useEffect(() => {
    if (!isSoftDeleted || !undoExpiresAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const expiry = new Date(undoExpiresAt);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null);
        // Trigger a data reload to convert to normal placeholder
        window.dispatchEvent(new CustomEvent('familyTreeDataUpdated', { 
          detail: { action: 'purge_expired_soft_deletions' } 
        }));
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isSoftDeleted, undoExpiresAt]);

  const formatTime = () => {
    if (!timeLeft) return "";
    if (timeLeft.days > 0) return `${timeLeft.days}d ${timeLeft.hours}h`;
    if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m`;
    return `${timeLeft.minutes}m`;
  };


  const finalRole = (role) => {

    if(role === 'null'){
      return null;
    }

    if (role === 'admin') {
      return <AdminBadge scared position="top-right" margin="-1px -13px 0px 0px" />;
    }
    if (role === 'moderator') {
      return <ModeratorBadge scared position="top-right" margin="-1px -13px 0px 0px" />;
    }
    if (role === 'editor') {
      return <EditorBadge scared  position="top-right" margin="-1px -13px 0px 0px" />;
    }
    return <ViewerBadge scared position="top-right" margin="-1px -13px 0px 0px" />;
  }

  return (
    <PersonCardHorizontalSVG className="person-card" style={style} variant={variant}>
      <div onClick={onClick}>
        <Row padding="0px" margin="0px" gap="0.25rem" fitContent style={{overflowX :"hidden"}}>

          <Card positionType="relative" backgroundColor="var(--color-transparent)" padding="2px 0px 3px 3px"  margin="0px">
            <ImageCard 
              overlay={
                deathDate ? { backgroundColor: "var(--color-gray)", opacity: 0.45 } : 
                isPlaceholder ? { backgroundColor: "var(--color-gray-light)", opacity: 0.3 } : null
              } 
              width="150px" 
              height="87px" 
              borderRadius="17px" 
              image={isPlaceholder ? null : profileImage} 
            />
            {isSoftDeleted && (
              <div style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                backgroundColor: 'var(--color-warning)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                DELETED
              </div>
            )}
            {finalRole(role)}
          </Card>

          <Card positionType="relative" backgroundColor="var(--color-transparent)"  padding="0px" margin="0px">

            <Row fitContent gap="0.10rem" padding="4px 0px 0px 0px" >
              {sex === "M" ? <Mars size={20} strokeWidth={3} color="var(--color-male)" /> : <Venus strokeWidth={3} size={25} color="var(--color-female)" />}
              <Text as="p" ellipsis variant="body1" bold>
                {isSoftDeleted ? "Soft Deleted" : name}
              </Text>
            </Row>


            <Row width="12rem" gap="0.15rem" padding="0px" fitContent style={{ justifyContent: "center" }}>
              {isSoftDeleted ? (
                <Row gap="0.25rem" align="center">
                  <Clock size={12} color="var(--color-warning)" />
                  <Text as="span" variant="caption1" style={{fontSize: "0.8em", color: "var(--color-warning)"}}>
                    {timeLeft ? `Restore in: ${formatTime()}` : "Expired"}
                  </Text>
                </Row>
              ) : isPlaceholder ? (
                <Text as="span" variant="caption1" style={{fontSize: "0.8em", color: "var(--color-gray-dark)"}}>
                  👤 Placeholder
                </Text>
              ) : deathDate ? (
                <>
                  <Text as="span" bold variant="caption1" style={{ fontSize: "0.8em" }}>🎂</Text>
                  <Text as="span" bold variant="caption1">{birthDate ? new Date(birthDate).getFullYear() : "?"}</Text>
                  <Text as="span" bold variant="caption1" style={{ padding: "0px 0px 0px 4px" }}>-</Text>
                  <Text as="span" bold variant="caption1" style={{ fontSize: "0.8em" }}>🪦</Text>
                  <Text as="span" bold variant="caption1">{deathDate ? new Date(deathDate).getFullYear() : "?"}</Text>
                </>
              ) : (
                <>
                  <Text as="span" variant="caption1" style={{ fontSize: "0.8em" }}>🎂</Text>
                  <Text as="span" bold variant="caption1">{formatDate(birthDate)}</Text>
                </>
              )}
            </Row>
            
          </Card>

          <Spacer vertical size="10px"/>

          {/* <Card rounded onClick={onAdd} margin="0px -10px 3px -10px" backgroundColor="var(--color-transparent)" size={18} padding="0px" >
            <Plus size={13} strokeWidth={3} />
          </Card> */}
        </Row>
      </div>
    </PersonCardHorizontalSVG>
  );
}

export default PersonCardHorizontal;
