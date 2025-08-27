// AddSpouseModal.jsx
import React from "react"; 
import AddSpouseForm from "./AddSpouseForm";
import '../../../styles/AddRelativeModal.css';
import { X } from 'lucide-react'; 
import Card from '../../../layout/containers/Card';

export default function AddSpouseModal({ onSubmit, onClose }) { 
  
  const handleFormSubmit = (formData) => {
    // Forward data to TreeCanvas
    onSubmit(formData);
    // Close modal after submit
    onClose();
  };

  const handleClose = () => { onClose(); };

  return (
    
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <Card onClick={handleClose} fitContent positionType='absolute' borderRadius='15px' backgroundColor="var(--color-danger)" margin='15px 15px 0px 0px' position='top-right' style={{ zIndex: 10}} >
          <X size={24} strokeWidth={3} color="white" /> 
        </Card>
        <div className="modal-header"> <h2 className="modal-title">Add New Spouse</h2> </div>
        <div className="modal-body">
        <AddSpouseForm onCancel={handleClose} onSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
}




