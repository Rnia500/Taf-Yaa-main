import React from "react";
import PersonCardHorizontalSVG from "../layout/containers/PersonCardHorizontalSVG";
import Card from "../layout/containers/Card";
import ImageCard from "../layout/containers/ImageCard";
import Text from "./Text";
import { Mars, Venus, Plus } from "lucide-react";
import Row from "../layout/containers/Row";
import { AdminBadge, ModeratorBadge, EditorBadge, ViewerBadge } from "./PersonBadge";
import Spacer from "./Spacer";
//variants are root, directline, spouce, dead

function PersonCardHorizontal({ variant = "default", style, name, sex, birthDate, deathDate, role = 'null', isDead = false, profileImage, onAdd, onClick }) {

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
            <ImageCard overlay={deathDate ? { backgroundColor: "var(--color-gray)", opacity: 0.45 } : null} width="150px" height="87px" borderRadius="17px" image={profileImage} />
            {finalRole(role)}
          </Card>

          <Card positionType="relative" backgroundColor="var(--color-transparent)"  padding="0px" margin="0px">

            <Row fitContent gap="0.10rem" padding="4px 0px 0px 0px" >
              {sex === "M" ? <Mars size={20} strokeWidth={3} color="var(--color-male)" /> : <Venus strokeWidth={3} size={25} color="var(--color-female)" />}
              <Text as="p" ellipsis variant="body1" bold>{name}</Text>
            </Row>


            <Row width="12rem" gap="0.15rem" padding="0px" fitContent style={{ justifyContent: "center" }}>
              {deathDate ? (
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
