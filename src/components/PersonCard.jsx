import React from "react";
import PersonCardSVG from "../layout/containers/PersonCardSVG";
import Card from "../layout/containers/Card";
import ImageCard from "../layout/containers/ImageCard";
import Text from "./Text";
import { Mars, Venus, Plus } from "lucide-react";
import Row from "../layout/containers/Row";
import { AdminBadge, ModeratorBadge, EditorBadge, ViewerBadge } from "./PersonBadge";
//variants are root, directline, spouce, dead

function PersonCard({ variant = "default", style, name, sex, birthDate, deathDate, role = 'null', profileImage, isDead = false, isPlaceholder = false, isSoftDeleted = false, onClick }) {

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const finalRole = (role) => {

    if(role === 'null'){
      return null;
    }

    if (role === 'admin') {
      return <AdminBadge position="top-right" margin="-1px -1px 0px 0px" />;
    }
    if (role === 'moderator') {
      return <ModeratorBadge position="top-right" margin="-1px -1px 0px 0px" />;
    }
    if (role === 'editor') {
      return <EditorBadge position="top-right" margin="-1px -1px 0px 0px" />;
    }
    return <ViewerBadge position="top-right" margin="-1px -1px 0px 0px" />;
  }

  return (
    <PersonCardSVG className="person-card" style={style} variant={variant}>
      <div onClick={onClick}>
      <Card positionType="relative" backgroundColor="var(--color-transparent)" padding="3px 3px 0px 3px">
        <ImageCard 
          overlay={
            deathDate ? { backgroundColor: "var(--color-gray)", opacity: 0.45 } : 
            isPlaceholder ? { backgroundColor: "var(--color-gray-light)", opacity: 0.3 } : null
          } 
          width="100%" 
          height="83px" 
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
        <Row fitContent gap="0.10rem" padding="4px 0px 0px 0px" >
          {sex === "M" ? <Mars size={20} strokeWidth={3} color="var(--color-male)" /> : <Venus strokeWidth={3} size={25} color="var(--color-female)" />}
          <Text as="p" ellipsis variant="body1" bold>{name}</Text>
        </Row>
        <Row fitContent gap="0.25rem" padding="0px" style={{ justifyContent: "center" }}>
          {isPlaceholder ? (
            <Text as="span" variant="caption1" style={{fontSize: "0.8em", color: "var(--color-gray-dark)"}}>
              {isSoftDeleted ? "🗑️ Soft Deleted" : "👤 Placeholder"}
            </Text>
          ) : deathDate ? (
            <>
              <Text as="span" bold variant="caption1" style={{fontSize: "0.8em"}}>🎂</Text>
              <Text as="span" bold variant="caption1">{birthDate ? new Date(birthDate).getFullYear() : "?"}</Text>
              <Text as="span" bold variant="caption1" style={{padding: "0px 0px 0px 4px"}}>-</Text>
              <Text as="span" bold variant="caption1" style={{fontSize: "0.8em"}}>🪦</Text>
              <Text as="span" bold variant="caption1">{deathDate ? new Date(deathDate).getFullYear() : "?"}</Text>
            </>
          ) : (
            <>
              <Text as="span" variant="caption1" style={{fontSize: "0.8em"}}>🎂</Text>
              <Text as="span" bold variant="caption1">{formatDate(birthDate)}</Text>
            </>
          )}
        </Row>
      </Card>
      </div>
    </PersonCardSVG>
  );
}

export default PersonCard;
