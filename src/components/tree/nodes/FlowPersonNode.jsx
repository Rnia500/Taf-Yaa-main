import React from 'react';
import PersonCard from '../../PersonCard.jsx';

function FlowPersonNode({ data }) {
  // Define what happens when a card is clicked
  const handleCardClick = () => {
    // For example, open a sidebar with this person's full profile
    console.log(`Card clicked for: ${data.name} (ID: ${data.id})`);
    // You would typically use a global state manager (like Zustand) to open the sidebar
    // useSidebarStore.getState().openProfile(data.id);
  };

  const handleAddClick = (e) => {
    // Stop the event from bubbling up to the main card's click handler
    e.stopPropagation(); 
    console.log(`Add button clicked for: ${data.name}`);
    // useModalStore.getState().openAddRelativeModal(data.id);
  };

  return (
    <PersonCard
      {...data}
      onClick={handleCardClick}
      onAdd={handleAddClick}
    />
  );
}

export default React.memo(FlowPersonNode);