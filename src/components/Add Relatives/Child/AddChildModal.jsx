import React from 'react';
import useModalStore from '../../../store/useModalStore';
import AddChildForm from './AddChildForm';
import { useFamilyData } from '../../../hooks/useFamilyData';
import '../../../styles/AddRelativeModal.css';
import { X } from 'lucide-react';
import Card from '../../../layout/containers/Card';

const AddChildModal = ({ onSubmit }) => {
  const { modals, modalData, closeModal } = useModalStore();
  const { people, marriages } = useFamilyData("tree001"); 
  const isOpen = modals.addChildModal || false;

  // Get the targetNodeId from modal data
  const targetNodeId = modalData.addChildModal?.targetNodeId;
  
  // Find the parent (the node clicked)
  const parent = people.find(person => person.id === targetNodeId);
  const parentName = parent ? parent.name : '';

  // Default partner name
  let otherParentName = 'Partner';
  
  // Find the spouse through marriages    
  if (targetNodeId) {
    const marriageAsHusband = marriages.find(m => m.husbandId === targetNodeId);
    if (marriageAsHusband && marriageAsHusband.wives?.length > 0) {
      const wife = people.find(p => p.id === marriageAsHusband.wives[0].id);
      if (wife) otherParentName = wife.name;
    }

    const marriageAsWife = marriages.find(m =>
      m.wives?.some(wife => wife.id === targetNodeId)
    );
    if (marriageAsWife) {
      const husband = people.find(p => p.id === marriageAsWife.husbandId);
      if (husband) otherParentName = husband.name;
    }
  }

  // Assign parent names clearly
  let parent1Name = "Father";
  let parent2Name = "Mother";

  if (parent) {
    if (parent.gender === "male") {
      parent1Name = parent.name;                // Father
      parent2Name = otherParentName || "Mother";
    } else if (parent.gender === "female") {
      parent1Name = otherParentName || "Father";
      parent2Name = parent.name;                // Mother
    } else {
      parent1Name = parent.name;                // Unknown gender fallback
      parent2Name = otherParentName || "Partner";
    }
  }

  const handleSubmit = (data) => {
    const submissionData = { ...data, targetNodeId };
    onSubmit(submissionData);
    closeModal('addChildModal');
  };

  const handleClose = () => {
    closeModal('addChildModal');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
       
        {/* Close button */}
        <Card
          onClick={handleClose}
          fitContent
          positionType='absolute'
          borderRadius='15px'
          backgroundColor="var(--color-danger)"
          margin='15px 15px 0px 0px'
          position='top-right'
          style={{ zIndex: 10 }}
        >
          <X size={24} strokeWidth={3} color="white" />
        </Card>

        <div className="modal-header">
          <h2 className="modal-title">Add New Child</h2>
        </div>

        <div className="modal-body">
          <AddChildForm 
            onSubmit={handleSubmit}
            onCancel={handleClose}
            parent1Name={parent1Name}
            parent2Name={parent2Name}
          />
        </div>
      </div>
    </div>
  );
};

export default AddChildModal;
