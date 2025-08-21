import React from 'react';
import useModalStore from '../../../store/useModalStore';
import usePersonMenuStore from '../../../store/usePersonMenuStore';
import AddSpouseForm from './AddSpouseForm';
import '../../../styles/AddRelativeModal.css';
import { X } from 'lucide-react';
import Card from '../../../layout/containers/Card';

const AddSpouseModal = ({ onSubmit }) => {
  const { modals, closeModal } = useModalStore();
  const { targetNodeId } = usePersonMenuStore();
  const isOpen = modals.addSpouseModal || false;

  const handleSubmit = (data) => {
    // Include the targetNodeId in the submission data
    const submissionData = {
      ...data,
      targetNodeId
    };
    onSubmit(submissionData);
    closeModal('addSpouseModal');
  };


  const handleClose = () => {
    closeModal('addSpouseModal');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

       
        <Card onClick={handleClose} fitContent positionType='absolute' borderRadius='15px' backgroundColor="var(--color-danger)" margin='15px 15px 0px 0px' position='top-right' style={{ zIndex: 10}} >
          <X size={24} strokeWidth={3} color="white" />
        </Card>

        
        <div className="modal-header">
          <h2 className="modal-title">Add New Spouse</h2>
        </div>

        
        <div className="modal-body">
          <AddSpouseForm 
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </div>
      </div>
    </div>
  );
};

export default AddSpouseModal;
