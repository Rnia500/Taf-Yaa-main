import React from 'react';
import '../../styles/PersonCardContainer.css';
import Card from './Card';
import { Mars, Venus, CakeIcon, Plus  } from 'lucide-react';

const PersonCardContainer = ({ children, variant = "default", name, sex, birthDate, deathDate, profileImage, onAdd }) => {
  return (
    <Card backgroundColor="var(--color-transparent)" height='200px' width='125px' padding='0px 0px 0px 0px' margin='0px' style={{ overflowY: 'hidden'}} >
      <div className={`person-card-container ${variant}`}>
      <div className="person-card-content">
        {children}
      </div>
      
      <button className="person-card-add-btn" onClick={onAdd}><Card rounded size={25} backgroundColor="var(--color-transparent)" positionType='absolute' onClick={onAdd}><Plus size={18} color='black' /></Card></button>
    </div>
    </Card>
  );
};

export default PersonCardContainer;
